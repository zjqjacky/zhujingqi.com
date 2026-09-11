#!/usr/bin/env node
/**
 * forum/rss.mjs — regenerate forum/rss.xml from the Zhujingqi forum.
 *
 * The forum is a static SPA; its posts live in Supabase and are served by an
 * edge function. RSS readers cannot execute JavaScript, so this script fetches
 * the latest posts (and their comments) from the same public APIs the SPA uses
 * and writes a static RSS 2.0 feed into forum/rss.xml. Run it whenever you want
 * the feed refreshed and commit the updated rss.xml (e.g.
 * `node forum/rss.mjs && git add forum/rss.xml`).
 *
 * The repository ships a GitHub Actions workflow (.github/workflows/forum-rss.yml)
 * that runs this script daily (16:00 UTC) and commits the refreshed feed.
 *
 * Usage:
 *   node forum/rss.mjs [--perPage 20] [--out forum/rss.xml] [--base https://zhujingqi.com]
 *
 * Dependencies: Node.js >= 18 (uses built-in fetch, no packages required).
 */
import { readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Same endpoints the forum SPA uses (see API_BASE in forum/index.html).
const API_BASE = "https://jqtljtnchkhzcxykfnoo.supabase.co/functions/v1";
const API_POSTS = `${API_BASE}/api/posts`;
const API_COMMENTS_BATCH = `${API_BASE}/api/comments/batch`;

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const EMOJI_DIR = path.join(SCRIPT_DIR, "emojis");

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const PER_PAGE = Number(getArg("--perPage", "20")) || 20;
const OUT_FILE = path.resolve(SCRIPT_DIR, getArg("--out", "rss.xml"));
const SITE_BASE = getArg("--base", "https://zhujingqi.com");
const FEED_URL = `${SITE_BASE}/forum/rss.xml`;
const FORUM_URL = `${SITE_BASE}/forum/`;

const escapeXml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Public display name: nickname when set, otherwise the account name.
const displayName = (u) => (u && (u.nickname || u.name)) || null;

const toRfc2822 = (iso) => {
  const d = new Date(String(iso).replace(/\.\d+(Z|[+-]\d{2}:?\d{2})$/, "$1"));
  return isNaN(d) ? new Date().toUTCString() : d.toUTCString().replace("GMT", "+0000");
};

const emojiNames = new Set(
  readdirSync(EMOJI_DIR)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.slice(0, -4).toLowerCase())
);

// Auto-linker mirroring the forum SPA's linkifyUrls() + linkifyMentions()
// (forum/index.html). Same regexes, same rules:
//   - bare domains get https:// prepended; full http(s) URLs link as-is
//   - @mentions link ONLY when the mentioned user exists (name matched
//     case-insensitively against GET /api/users), to ?uid=<id>
//   - mentions are processed first, then URLs — so a URL never gets wrapped
//     inside an existing anchor (SPA skips .mentionLink nodes in linkifyUrls)
const URL_REG = /(^|[\s(])((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?)/gi;
const MENTION_REG = /(^|[\s(])@([\p{L}\p{N}_-]{1,32})/gu;

const linkifyUrls = (text) => {
  if (!text) return "";
  URL_REG.lastIndex = 0;
  let out = "";
  let last = 0;
  let m;
  while ((m = URL_REG.exec(text))) {
    out += text.slice(last, m.index);
    const prefix = m[1] || "";
    const url = m[2];
    const href = /^https?:\/\//i.test(url) ? url : "https://" + url;
    out += `${prefix}<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    last = m.index + m[0].length;
  }
  return out + text.slice(last);
};

const linkifyMentions = (text, userByName) => {
  if (!text || !text.includes("@") || userByName.size === 0) return text;
  MENTION_REG.lastIndex = 0;
  let out = "";
  let last = 0;
  let m;
  while ((m = MENTION_REG.exec(text))) {
    out += text.slice(last, m.index);
    const full = m[0];
    const prefix = m[1] || "";
    const uname = m[2];
    const found = userByName.get(uname.toLowerCase());
    if (found) {
      out += `${prefix}<a class="mentionLink" href="${FORUM_URL}?uid=${found.id}" target="_blank" rel="noopener noreferrer">@${found.name}</a>`;
    } else {
      out += full;
    }
    last = m.index + full.length;
  }
  return out + text.slice(last);
};

const autoLink = (text, userByName) => {
  // mentions first (exact SPA order); URL-link only the parts between
  // mention anchors so ?uid= hrefs never get re-wrapped
  const parts = linkifyMentions(text, userByName).split(/(<a class="mentionLink"[^>]*>.*?<\/a>)/g);
  return parts.map((part, i) => (i % 2 === 1 ? part : linkifyUrls(part))).join("");
};

// Convert raw post/comment text to description HTML. Text is inserted RAW
// (no escaping here) — the whole string is escaped exactly once when the
// <description> element is emitted. Raw <br>/<small>/<img>/<b> child elements
// inside <description> are invalid RSS 2.0 (description must be character
// data) and cause strict parsers like NetNewsWire's RSParser to reject items.
// Forum content markers mirroring the SPA's getPostMeta():
//   :emoji:        -> the forum's own SVG image
//   [img:URL]      -> inline <img> (the SPA shows only the first as a
//                     click-to-load button; the feed renders all of them)
//   [[music:ID]] / [[music:(netease|qq):ID]] -> plain link (readers strip iframes)
// Plain text also passes through autoLink() (URLs + @mentions, as in the SPA).
const contentToHtml = (raw, userByName = new Map()) => {
  const reg = /:([a-zA-Z0-9_-]+):|\[img:(.*?)\]|\[\[music:(netease|qq):(\d+)\]\]|\[\[music:(\d+)\]\]/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = reg.exec(raw))) {
    out += autoLink(raw.slice(last, m.index), userByName);
    if (m[1] !== undefined) {
      const name = m[1].toLowerCase();
      if (emojiNames.has(name)) {
        out += `<img src="${FORUM_URL}emojis/${name}.svg" alt=":${name}:" width="18" height="18" />`;
      } else {
        out += `:${m[1]}:`;
      }
    } else if (m[2] !== undefined) {
      out += `<img src="${m[2]}" alt="image" />`;
    } else {
      const id = m[4] || m[5];
      const type = m[3] || "netease";
      const url = type === "qq"
        ? `https://y.qq.com/n/ryqq/songDetail/${id}`
        : `https://music.163.com/#/song?id=${id}`;
      out += `<a href="${url}">🎵 ${type === "qq" ? "QQ 音乐" : "网易云音乐"}</a>`;
    }
    last = m.index + m[0].length;
  }
  out += autoLink(raw.slice(last), userByName);
  return out.replace(/\n/g, "<br />");
};

// Comments may be replies; the content starts with "[reply:<parentId>] ".
const parseReply = (content) => {
  const m = String(content || "").match(/^\[reply:(\d+)\]\s*/);
  return m
    ? { parentId: Number(m[1]), text: content.slice(m[0].length) }
    : { parentId: null, text: content || "" };
};

// Fetch comments for every post in one batch call (same endpoint the SPA uses),
// grouped by post id and sorted chronologically. Reply targets are resolved
// afterwards against each post's own comment list.
async function fetchComments(posts) {
  if (!posts.length) return new Map();
  const res = await fetch(API_COMMENTS_BATCH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postIds: posts.map((p) => p.id) }),
  });
  if (!res.ok) throw new Error(`comments API returned ${res.status}: ${await res.text()}`);
  const list = await res.json();
  const byPost = new Map();
  for (const c of Array.isArray(list) ? list : []) {
    if (!byPost.has(c.postid)) byPost.set(c.postid, []);
    byPost.get(c.postid).push(c);
  }
  for (const arr of byPost.values()) {
    arr.sort((a, b) => new Date(a.time) - new Date(b.time));
  }
  return byPost;
}

function commentsToHtml(comments, userByName = new Map()) {
  if (!comments || !comments.length) return "";
  const nameById = new Map(comments.map((c) => [c.id, displayName(c.users)]));
  const lines = comments.map((c) => {
    const author = displayName(c.users) || "?";
    const { parentId, text } = parseReply(c.content);
    const parentName = parentId ? nameById.get(parentId) : null;
    const replyPrefix = parentName ? `回复 @${parentName} · ` : "";
    const when = String(c.time || "").replace("T", " ").replace(/\.\d+$/, "").slice(0, 16);
    const whenHtml = when ? ` <small style="color:#888">${when}</small>` : "";
    return `${replyPrefix}<b>${author}</b>: ${contentToHtml(text, userByName)}${whenHtml}`;
  });
  return `<br /><br /><b>💬 评论 (${comments.length})</b><br />${lines.join("<br />")}`;
}

// Posts have no titles; derive one from the content (or the author's name).
const makeTitle = (post) => {
  const text = String(post.content || "")
    .replace(/:([a-zA-Z0-9_-]+):/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text) return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  return displayName(post.users) || `Post ${post.id}`;
};

function buildItem(post, comments, userByName = new Map()) {
  const permalink = `${FORUM_URL}?pid=${post.id}`;
  const author = displayName(post.users) || String(post.author);
  const meta = [
    author ? `作者: ${author}` : "",
    post.tag ? `标签: ${post.tag}` : "",
    `👍 ${post.likes ?? 0} / 👎 ${post.dislikes ?? 0}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const descHtml = `${contentToHtml(post.content || "", userByName)}${meta ? `<br /><br /><small>${meta}</small>` : ""}${commentsToHtml(comments, userByName)}`;
  return `    <item>
      <title>${escapeXml(makeTitle(post))}</title>
      <link>${permalink}</link>
      <guid isPermaLink="true">${permalink}</guid>
      <pubDate>${toRfc2822(post.time)}</pubDate>
      <dc:creator>${escapeXml(author)}</dc:creator>
      <description>${escapeXml(descHtml)}</description>
    </item>`;
}

async function main() {
  console.log(`Fetching ${API_POSTS}?page=1&perPage=${PER_PAGE} …`);
  const res = await fetch(`${API_POSTS}?page=1&perPage=${PER_PAGE}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const posts = Array.isArray(data.posts) ? data.posts : [];

  let commentsByPost = new Map();
  try {
    commentsByPost = await fetchComments(posts);
  } catch (err) {
    console.warn(`Warning: comments fetch failed (${err.message}); feed will omit comments.`);
  }
  const commentCount = [...commentsByPost.values()].reduce((n, a) => n + a.length, 0);

  // User list for @mention linking (same source the SPA's linkifyMentions uses).
  // If it fails, mentions simply stay plain text — exactly like the forum when
  // its user cache is empty.
  let userByName = new Map();
  try {
    const usersRes = await fetch(`${API_BASE}/api/users`, {
      headers: { "Content-Type": "application/json" },
    });
    if (usersRes.ok) {
      const users = await usersRes.json();
      if (Array.isArray(users)) {
        for (const u of users) {
          if (u && u.name) userByName.set(String(u.name).toLowerCase(), u);
        }
      }
    }
  } catch (err) {
    console.warn(`Warning: users fetch failed (${err.message}); @mentions will not be linked.`);
  }

  const items = posts
    .map((p) => buildItem(p, commentsByPost.get(p.id) || [], userByName))
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Jacky 论坛 - Zhujingqi</title>
    <link>${FORUM_URL}</link>
    <description>Zhujingqi 论坛最新帖子 / Latest posts from the Jacky forum</description>
    <language>zh-CN</language>
    <lastBuildDate>${toRfc2822(new Date().toISOString())}</lastBuildDate>
    <ttl>60</ttl>
    <generator>forum/rss.mjs</generator>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  writeFileSync(OUT_FILE, xml, "utf8");
  console.log(
    `Wrote ${OUT_FILE} (${posts.length} items, ${commentCount} comments, ${data.count ?? "?"} total posts).`
  );
}

main().catch((err) => {
  console.error(`rss.mjs failed: ${err.message}`);
  process.exit(1);
});
