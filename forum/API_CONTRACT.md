# Post Visibility Scope — API Contract

## Overview

This document specifies the backend (Supabase Edge Functions) changes needed to support per-post visibility scope. The frontend sends `scope`, `allow_user_ids`, `allow_tag_ids`, `deny_user_ids`, and `deny_tag_ids` when creating a post. The backend must enforce visibility on all read endpoints.

## Data Model Changes

### posts table

Add columns to the `posts` table:

```sql
ALTER TABLE posts
  ADD COLUMN scope TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN allow_user_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN allow_tag_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN deny_user_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN deny_tag_ids JSONB DEFAULT '[]'::jsonb;
```

- **scope**: `'public'` | `'followers'` | `'private'` | `'custom'`
- **allow_user_ids**: array of user IDs allowed to see (for custom scope)
- **allow_tag_ids**: array of user-group IDs (from `user_groups`) whose members can see (for custom scope)
- **deny_user_ids**: array of user IDs blocked from seeing (for custom scope)
- **deny_tag_ids**: array of user-group IDs whose members are blocked from seeing (for custom scope)

Existing rows default to `scope = 'public'` — no data migration needed.

### user_groups table (new)

```sql
CREATE TABLE user_groups (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### user_group_members table (new)

```sql
CREATE TABLE user_group_members (
  group_id BIGINT NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
```

### RLS policies

- `user_groups`: owner can read/write their own rows; others cannot see.
- `user_group_members`: owner can read/write members of their own groups; others cannot see.

## API Endpoints — New

### User Groups

All endpoints require authentication (JWT).

#### `GET /api/user-groups`

Returns the current user's groups with member counts and members.

Response:
```json
[
  {
    "id": 1,
    "name": "Friends",
    "members": [
      { "user_id": 123, "name": "alice" },
      { "user_id": 456, "name": "bob" }
    ],
    "member_count": 2
  }
]
```

#### `POST /api/user-groups`

Create a new group.

Body:
```json
{ "name": "Group Name" }
```

#### `PUT /api/user-groups/:id`

Rename a group (owner only).

Body:
```json
{ "name": "New Name" }
```

#### `DELETE /api/user-groups/:id`

Delete a group and all its memberships (owner only).

#### `POST /api/user-groups/:id/members`

Add a user to a group.

Body:
```json
{ "user_id": 123 }
```

#### `DELETE /api/user-groups/:id/members?user_id=123`

Remove a user from a group.

## API Endpoints — Modified

### `POST /api/posts` (create post)

New fields in request body:

```json
{
  "id": 1234567890,
  "content": "...",
  "time": "2026-01-01T00:00:00.000Z",
  "author": 123,
  "tag": "日常",
  "scope": "custom",
  "allow_user_ids": [456, 789],
  "allow_tag_ids": [1],
  "deny_user_ids": [],
  "deny_tag_ids": []
}
```

- `scope` is required (default `'public'`).
- `allow_*` / `deny_*` arrays are only meaningful when `scope = 'custom'`.

### `GET /api/posts` (list / search)

Must filter posts by visibility. The `userId` query param (current user) determines what the requester can see.

Visibility rule for a given requester `U` and post `P`:

```
if P.author == U → visible (author always sees own posts)
if P.scope == 'public' → visible (guests see public only)
if P.scope == 'followers' → visible if U follows author (follows table: follower=U, followee=P.author)
if P.scope == 'private' → visible only to author (and admins for moderation)
if P.scope == 'custom':
  visible = (
    (U.id in P.allow_user_ids OR U is member of any P.allow_tag_ids)
    AND NOT (U.id in P.deny_user_ids OR U is member of any P.deny_tag_ids)
  )
```

Guests (no userId) see only `public` posts.

Admins see all posts (for moderation). Add `&admin=1` or detect admin role from JWT.

### `GET /api/posts/single?id=...&userId=...`

Apply same visibility rule. Return 404 (or `{ "error": "Post not found" }`) if the requester cannot see the post.

### `GET /api/posts/random`

Filter by visibility before selecting random post. Guests get random public post only.

### `GET /api/posts/days?days=7&tz=...`

Count only visible posts per day. Guests see only public posts counted.

### `GET /api/stats`

`postCount` should count only posts visible to the requester (or all if admin). This prevents leaking that a private post exists.

### `POST /api/comments/batch`

Only return comments for posts the requester can see. This prevents leaking comments of private/custom posts.

## Implementation Notes

- The `scope` field must be returned in all post objects from GET endpoints so the frontend can render the appropriate badge.
- When `scope = 'custom'`, the `allow_user_ids`, `allow_tag_ids`, `deny_user_ids`, `deny_tag_ids` fields should also be returned (or at least the computed `allow_count` / `deny_count` for display).
- For the `GET /api/users` endpoint used for user search in group management, ensure it returns all users (not just public profiles) so the owner can add them to groups.
- The user-group APIs (`/api/user-groups`) should return members with their `user_id` and `name` so the frontend can display them.
