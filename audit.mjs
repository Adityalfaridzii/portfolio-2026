/**
 * audit.mjs — the checks I actually run before saying "the site is fine".
 *
 *   node audit.mjs
 *
 * Starts its own static server, walks every page at two widths, and exits
 * non-zero if anything fails. Nothing here needs a build step.
 *
 * Playwright is resolved from this folder first, then from the sibling
 * repositories that already have it installed.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const PORT = 4199;
const PAGES = [
  ["index", ""],
  ["amb-copilot", "amb-copilot.html"],
  ["qa-dashboard", "qa-dashboard.html"],
  ["automation", "automation.html"],
  ["traveloka-automation", "traveloka-automation.html"],
  ["traveloka-identity", "traveloka-identity.html"],
  ["cv", "cv.html"],
];

/* ---------------------------------------------------------------- playwright */

async function loadChromium() {
  const bases = [
    ROOT,
    resolve(ROOT, "../playwright-amb"),
    resolve(ROOT, "../automation-amb-ui-v2.0"),
    resolve(ROOT, "../test-playwright-bdd"),
  ];
  for (const base of bases) {
    try {
      const require = createRequire(join(base, "noop.js"));
      const entry = require.resolve("playwright");
      const mod = await import(pathToFileURL(entry).href);
      /* playwright is CommonJS: the named export may not be detected, so the
         real object can sit on .default */
      const chromium = mod.chromium || (mod.default && mod.default.chromium);
      if (chromium) return chromium;
    } catch {
      /* try the next one */
    }
  }
  return null;
}

/* ------------------------------------------------------------------- server */

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      const rel = normalize(url === "/" ? "/index.html" : url).replace(/^([/\\])+/, "");
      const file = join(ROOT, rel);
      if (!file.startsWith(ROOT)) return res.writeHead(403).end();
      const buf = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(buf);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" }).end("not found");
    }
  });
  return new Promise((ok) => server.listen(PORT, "127.0.0.1", () => ok(server)));
}

/* ------------------------------------------------------------------ checks */

function contrastAudit() {
  const parse = (s) => {
    const n = (s.match(/-?\d*\.?\d+/g) || []).map(Number);
    if (s.startsWith("color(")) return { r: n[0] * 255, g: n[1] * 255, b: n[2] * 255, a: n.length > 3 ? n[3] : 1 };
    return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const bgOf = (el) => {
    let n = el;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.a > 0.9) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const fails = [];
  const seen = new Set();
  document.querySelectorAll("p, span, td, th, a, li, dt, dd, figcaption, h1, h2, h3, b, caption").forEach((el) => {
    const t = (el.textContent || "").trim();
    if (!t || el.children.length) return;
    const cs = getComputedStyle(el);
    const bg = bgOf(el);
    const f0 = parse(cs.color);
    const fg = { r: f0.a * f0.r + (1 - f0.a) * bg.r, g: f0.a * f0.g + (1 - f0.a) * bg.g, b: f0.a * f0.b + (1 - f0.a) * bg.b };
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    const key = cs.color + "|" + size + "|" + t.slice(0, 12);
    if (ratio < need && !seen.has(key)) {
      seen.add(key);
      fails.push(t.slice(0, 28) + " → " + ratio.toFixed(2) + ":1 (need " + need + ")");
    }
  });
  return fails;
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

/* -------------------------------------------------------------------- main */

const chromium = await loadChromium();
if (!chromium) {
  console.error("✗ playwright not found. Install it, or run this from the folder that has it.");
  process.exit(2);
}

const server = await startServer();
const base = "http://127.0.0.1:" + PORT + "/";
const browser = await chromium.launch();
const failures = [];
const rows = [];
const ogImages = new Set();

for (const [name, path] of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  const badStatus = [];
  page.on("response", (r) => r.status() >= 400 && badStatus.push(r.status() + " " + r.url().replace(base, "")));

  await page.goto(base + path, { waitUntil: "load" });
  await scrollThrough(page);

  const dom = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    return {
      brokenImages: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src.split("/").pop()),
      duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
      h1: document.querySelectorAll("h1").length,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      nestedCards: document.querySelectorAll(".prose .decision .decision").length,
      divs: (() => {
        const html = document.documentElement.outerHTML;
        const open = (html.match(/<div\b/g) || []).length;
        const close = (html.match(/<\/div>/g) || []).length;
        return { open, close, balanced: open === close };
      })(),
      anchorsResolve: [...document.querySelectorAll('.toc-bar a')].every((a) => !!document.getElementById(a.getAttribute("href").slice(1))),
      railLinks: document.querySelectorAll(".toc-bar a").length,
      railActiveAtTop: !!document.querySelector('.toc-bar a[aria-current="true"]'),
      ogImage: (document.querySelector('meta[property="og:image"]') || {}).content || null,
      title: document.title || "",
    };
  });
  const contrast = await page.evaluate(contrastAudit);

  // mobile
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mobileErrors = [];
  mobile.on("pageerror", (e) => mobileErrors.push(e.message));
  await mobile.goto(base + path, { waitUntil: "load" });
  await scrollThrough(mobile);
  const mobileState = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    brokenImages: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length,
  }));
  await mobile.close();

  const pageFailures = [];
  if (consoleErrors.length) pageFailures.push("console: " + consoleErrors.join(" | "));
  if (mobileErrors.length) pageFailures.push("mobile console: " + mobileErrors.join(" | "));
  if (badStatus.length) pageFailures.push("http: " + badStatus.join(" | "));
  if (dom.brokenImages.length) pageFailures.push("broken images: " + dom.brokenImages.join(", "));
  if (dom.duplicateIds.length) pageFailures.push("duplicate ids: " + [...new Set(dom.duplicateIds)].join(", "));
  if (dom.h1 !== 1) pageFailures.push("h1 count = " + dom.h1);
  if (dom.overflow) pageFailures.push("desktop overflow");
  if (mobileState.overflow) pageFailures.push("mobile overflow");
  if (dom.nestedCards) pageFailures.push("nested .decision cards: " + dom.nestedCards);
  if (!dom.divs.balanced) pageFailures.push("<div> " + dom.divs.open + " open vs " + dom.divs.close + " close");
  if (dom.railLinks && !dom.anchorsResolve) pageFailures.push("rail anchor does not resolve");
  if (dom.railActiveAtTop) pageFailures.push("rail marks a section at the top of the page");
  if (!dom.ogImage) pageFailures.push("no og:image — a shared link would show an empty card");
  if (!dom.title) pageFailures.push("empty document title");
  ogImages.add(dom.ogImage);
  if (contrast.length) pageFailures.push("contrast: " + contrast.join(" | "));

  rows.push({
    page: name,
    errors: consoleErrors.length + mobileErrors.length,
    broken: dom.brokenImages.length,
    contrast: contrast.length,
    nested: dom.nestedCards,
    divs: dom.divs.balanced ? "ok" : "BROKEN",
    rail: dom.railLinks,
    result: pageFailures.length ? "FAIL" : "pass",
  });
  if (pageFailures.length) failures.push({ page: name, issues: pageFailures });
  await page.close();
}

/* internal links resolve */
const ctx = await browser.newContext();
const request = ctx.request;
const links = new Set();
for (const [, path] of PAGES) {
  const page = await browser.newPage();
  await page.goto(base + path, { waitUntil: "load" });
  (await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"))))
    .filter((h) => h && !/^(https?:|mailto:|tel:|#)/.test(h))
    .forEach((h) => links.add(h));
  await page.close();
}
for (const href of links) {
  const r = await request.get(base + href);
  if (r.status() !== 200) failures.push({ page: "links", issues: ["404: " + href] });
}

/* the social card must actually exist on the server */
for (const og of ogImages) {
  if (!og) continue;
  const r = await request.get(base + og);
  if (r.status() !== 200) failures.push({ page: "og:image", issues: [og + " → HTTP " + r.status()] });
}
await request.dispose();

/* print: the CV must leave no blank space behind */
const cvp = await browser.newPage();
await cvp.goto(base + "cv.html", { waitUntil: "load" });
await cvp.emulateMedia({ media: "print" });
const printBg = await cvp.evaluate(() => getComputedStyle(document.body).backgroundColor);
if (printBg !== "rgb(255, 255, 255)") failures.push({ page: "print", issues: ["cv print background is " + printBg] });
await cvp.close();

await browser.close();
server.close();

/* ---------------------------------------------------------------- report */

const pad = (s, n) => String(s).padEnd(n);
console.log("\n" + pad("page", 22) + pad("errors", 8) + pad("imgs", 6) + pad("contrast", 10) + pad("nested", 8) + pad("divs", 7) + pad("rail", 6) + "result");
console.log("-".repeat(80));
for (const r of rows) {
  console.log(pad(r.page, 22) + pad(r.errors, 8) + pad(r.broken, 6) + pad(r.contrast, 10) + pad(r.nested, 8) + pad(r.divs, 7) + pad(r.rail, 6) + r.result);
}
console.log("-".repeat(80));

if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures) console.log("  ✗ " + f.page + ": " + f.issues.join("; "));
  process.exit(1);
}
console.log("\nAll checks passed on " + rows.length + " pages, desktop and mobile.");
