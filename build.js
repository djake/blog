import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

const SITE_TITLE = "djake";
const POSTS_DIR = "posts";
const OUT = "dist";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fmtDate = (d) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });

function parsePost(file) {
  const raw = readFileSync(join(POSTS_DIR, file), "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(
    m[1].split("\n").filter((l) => l.includes(":")).map((l) => {
      const i = l.indexOf(":");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
  );
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? "")) {
    throw new Error(`${file}: needs "title" and "date: YYYY-MM-DD" in front matter`);
  }
  return { ...meta, slug: file.replace(/\.md$/, ""), html: marked.parse(m[2]) };
}

const layout = (title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { max-width: 40rem; margin: 3rem auto; padding: 0 1rem; font: 18px/1.6 Georgia, serif; }
  header a { text-decoration: none; color: inherit; font-weight: bold; }
  ul.posts { list-style: none; padding: 0; }
  ul.posts li { margin: .5rem 0; }
  time { color: GrayText; font-size: .9em; margin-right: .75rem; }
  img { max-width: 100%; }
  pre { overflow-x: auto; padding: 1rem; background: rgba(127,127,127,.12); }
  code { font-size: .9em; }
</style>
</head>
<body>
<header><a href="/">${esc(SITE_TITLE)}</a></header>
<main>
${body}
</main>
</body>
</html>
`;

function write(path, html) {
  mkdirSync(join(OUT, path), { recursive: true });
  writeFileSync(join(OUT, path, "index.html"), html);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
if (existsSync("static")) cpSync("static", OUT, { recursive: true });

const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map(parsePost)
  .filter((p) => p.draft !== "true")
  .sort((a, b) => b.date.localeCompare(a.date)); // newest first; swap a/b for oldest first

for (const p of posts) {
  write(p.slug, layout(p.title, `<article>
<h1>${esc(p.title)}</h1>
<time datetime="${p.date}">${fmtDate(p.date)}</time>
${p.html}
</article>`));
}

write("", layout(SITE_TITLE, `<h1>Welcome!</h1>
<ul class="posts">
${posts.map((p) => `<li><time datetime="${p.date}">${fmtDate(p.date)}</time><a href="/${p.slug}/">${esc(p.title)}</a></li>`).join("\n")}
</ul>`));

writeFileSync(join(OUT, "404.html"), layout("Not found", `<h1>Not found</h1><p><a href="/">Home</a></p>`));

console.log(`Built ${posts.length} post(s) into ${OUT}/`);
