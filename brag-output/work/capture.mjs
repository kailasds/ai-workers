import puppeteer from "puppeteer-core";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE || "http://localhost:55977";
const OUT = fileURLToPath(new URL("./cap/", import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const meta = {};

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--font-render-hinting=none"],
});
const page = await browser.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function go(path, w = 1600, h = 900, wait = 900) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, h - 1);
  await sleep(wait);
}

// Tag the innermost element matching a predicate so we can screenshot / measure it.
async function tag(name, fnSrc) {
  const ok = await page.evaluate(
    (name, fnSrc) => {
      const fn = new Function("el", `return (${fnSrc})(el)`);
      const all = [...document.querySelectorAll("*")].filter(fn);
      const inner = all.filter((el) => !all.some((o) => o !== el && el.contains(o)));
      const el = inner[0];
      if (!el) return false;
      el.setAttribute("data-cap", name);
      return true;
    },
    name,
    fnSrc
  );
  if (!ok) throw new Error("tag failed: " + name);
  return page.$(`[data-cap="${name}"]`);
}

async function box(h) {
  const b = await h.boundingBox();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}

// 1. Candidate card (hook)
await go("/learning/candidates", 1440, 900);
{
  const el = await tag("cand", `(el) => el.tagName === "DIV" && el.className.includes("shadow-card") && el.className.includes("p-4") && el.textContent.includes("CLIENT_ACKNOWLEDGE")`);
  await el.screenshot({ path: OUT + "cand_card.png", omitBackground: true });
  meta.cand = await box(el);
}

// 2. Learning shell (reveal) + graph (highlight 1)
await go("/learning", 1600, 900, 2500);
await page.screenshot({ path: OUT + "learning_shell.png" });
await go("/learning", 1920, 1080, 3000);
{
  const el = await tag("graph", `(el) => el.tagName === "DIV" && el.className.includes("rounded-card") && el.className.includes("overflow-hidden") && !!el.querySelector(".react-flow")`);
  await el.evaluate((n) => n.scrollIntoView({ block: "center" }));
  await sleep(600);
  await page.mouse.move(0, 0);
  await el.screenshot({ path: OUT + "graph.png" });
  meta.graph = await box(el);
  const stages = await page.evaluate(() => {
    const g = document.querySelector('[data-cap="graph"]').getBoundingClientRect();
    return [...document.querySelectorAll('[data-cap="graph"] *')]
      .filter((n) => n.children.length === 0 && /^(workers|topics|knowledge|candidate knowledge|certified knowledge|knowledge packs)$/i.test(n.textContent.trim()))
      .map((n) => {
        const r = n.getBoundingClientRect();
        return { text: n.textContent.trim(), x: r.x - g.x, y: r.y - g.y, w: r.width, h: r.height };
      });
  });
  meta.stages = stages.filter((s) => s.y < 60);
  meta.nodes = await page.evaluate(() => {
    const g = document.querySelector('[data-cap="graph"]').getBoundingClientRect();
    return [...document.querySelectorAll('[data-cap="graph"] .react-flow__node')].map((n) => {
      const r = n.getBoundingClientRect();
      return { text: n.innerText.replace(/\s+/g, " ").slice(0, 90), x: r.x - g.x, y: r.y - g.y, w: r.width, h: r.height };
    });
  });
  meta.icons = await page.evaluate(() => {
    const out = {};
    for (const a of document.querySelectorAll("aside nav a")) out[a.getAttribute("href")] = a.querySelector("svg").outerHTML;
    return out;
  });
}

// 3. Sentinel overview
await go("/sentinel", 1600, 900, 900);
await page.screenshot({ path: OUT + "sentinel.png" });
{
  const row = await tag("srow", `(el) => el.tagName === "A" && el.textContent.includes("CLIENT_ACKNOWLEDGE")`);
  meta.sentinelRow = await box(row);
}

// 4. Candidate review — before and after Accept
await go("/learning/candidates/cand-jms-ack", 1600, 900, 900);
await page.screenshot({ path: OUT + "review_before.png" });
{
  const btn = await tag("accept", `(el) => el.tagName === "BUTTON" && el.textContent.trim() === "Accept"`);
  meta.accept = await box(btn);
  await btn.click();
  await page.mouse.move(0, 899);
  await sleep(700);
  await page.screenshot({ path: OUT + "review_after.png" });
  const panel = await tag("panel", `(el) => el.tagName === "DIV" && el.className.includes("sticky") && el.textContent.includes("now certified")`);
  meta.panel = await box(panel);
}

// 5. Registry card + "Why Gold?" popover
await go("/workers", 1600, 900, 1600);
await page.screenshot({ path: OUT + "registry.png" });
{
  const card = await tag("wcard", `(el) => el.tagName === "DIV" && el.className.includes("shadow-card") && el.className.includes("p-4") && el.textContent.includes("Integration Modernization Worker") && el.textContent.includes("View Worker")`);
  meta.card = await box(card);
  const gold = await page.evaluateHandle(() => [...document.querySelectorAll('[data-cap="wcard"] button')].find((b) => b.textContent.trim() === "Gold"));
  meta.gold = await box(gold);
  await gold.click();
  await page.mouse.move(0, 899);
  await sleep(600);
  await page.screenshot({ path: OUT + "registry_popover.png" });
  const pop = await page.$("[data-radix-popper-content-wrapper]");
  meta.popover = await box(pop);
}

fs.writeFileSync(OUT + "meta.json", JSON.stringify(meta, null, 2));
await browser.close();
console.log(JSON.stringify(meta, null, 2));
