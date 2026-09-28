import puppeteer from "puppeteer-core";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE || "http://localhost:5173";
const OUT = fileURLToPath(new URL("./cap/", import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const meta = { shots: {}, boxes: {} };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--font-render-hinting=none"],
});
let page = await browser.newPage();
page.on("pageerror", (e) => console.error("pageerror:", e.message));

async function go(path, w = 1600, h = 900, wait = 900) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto(BASE + path, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(w - 1, h - 1);
  await sleep(wait);
}
// The app scrolls inside <main>, so a "full" shot grows the viewport to main's content height.
async function shot(name, full = false) {
  let hgt = 900;
  if (full) {
    hgt = Math.max(900, Math.ceil(await page.evaluate(() => document.querySelector("main").scrollHeight)));
    await page.setViewport({ width: 1600, height: hgt, deviceScaleFactor: 2 });
    await sleep(500);
  }
  await page.mouse.move(1599, hgt - 1);
  await sleep(120);
  await page.screenshot({ path: OUT + name + ".png" });
  meta.shots[name] = { w: 1600, h: hgt };
  console.log("shot", name, meta.shots[name]);
  if (full) { await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 }); await sleep(300); }
}
// Find the innermost element of `sel` whose trimmed text equals / contains `text`; record and return its box.
async function el(key, sel, text, { contains = false, nth = 0 } = {}) {
  const b = await page.evaluate(
    (sel, text, contains, nth, key) => {
      const all = [...document.querySelectorAll(sel)].filter((e) => {
        const t = (e.innerText || e.textContent || "").trim().replace(/\s+/g, " ");
        return contains ? t.includes(text) : t === text;
      });
      const inner = all.filter((e) => !all.some((o) => o !== e && e.contains(o)));
      const e = inner[nth];
      if (!e) return null;
      e.setAttribute("data-cap", key);
      const r = e.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
    },
    sel, text, contains, nth, key
  );
  if (!b) throw new Error(`element not found: ${key} (${sel} "${text}")`);
  meta.boxes[key] = b;
  return page.$(`[data-cap="${key}"]`);
}
async function click(handle, wait = 500) {
  await handle.click();
  await sleep(wait);
}

// ---------- icons from the sidebar ----------
await go("/", 1600, 900, 2800);
meta.icons = await page.evaluate(() => {
  const out = {};
  for (const a of document.querySelectorAll("aside nav a")) out[a.getAttribute("href")] = a.querySelector("svg").outerHTML;
  return out;
});
meta.nav = await page.evaluate(() => [...document.querySelectorAll("aside nav a")].map((a) => { const r = a.getBoundingClientRect(); return { href: a.getAttribute("href"), x: r.x, y: r.y, w: r.width, h: r.height }; }));
await shot("dashboard");
await shot("dashboard_full", true);
await el("dodEvidence", "h2,h3,p,span,div", "Definition of Done evidence");

// ---------- Compose flow ----------
await go("/workers/new", 1600, 900, 900);
await shot("c_type");
let h = await el("startBuilding", "p,span,div,a,button", "Start building", { nth: 0 });
await click(h, 700);
h = await el("identityTrigger", "button", "Choose an identity");
await click(h, 500);
await shot("c_identity_open");
h = await el("identityOption", "button", "Integration modernization", { contains: true });
await click(h, 600);
h = await el("domainTrigger", "button", "No business domain");
await click(h, 500);
h = await el("domainOption", "button", "Payments", { contains: true });
await click(h, 700);
h = await el("autoAssemble", "label", "Auto-assemble preset", { contains: true });
await (await h.$("button")).click();
await sleep(300);
await shot("c_identity");
await shot("c_identity_full", true);
h = await el("confirmIdentity", "button", "Confirm identity");
await click(h, 700);
await shot("c_intent");
h = await el("confirmIntent", "button", "Confirm Worker intent");
await click(h, 1900);
await shot("c_brain_mid");
await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Continue" && !b.disabled), { timeout: 20000 });
await sleep(500);
await shot("c_brain_done");
await shot("c_brain_done_full", true);
h = await el("continueBrain", "button", "Continue");
await click(h, 700);
await shot("c_dod");
h = await el("confirmDod", "button", "Confirm Definition of Done");
await click(h, 700);
await shot("c_autonomy");
h = await el("packageDeploy", "button", "Package and deploy");
await click(h, 900);
await shot("c_package");
await shot("c_package_full", true);
h = await el("brainFacet", "button", "Brain", { contains: false });
await click(h, 500);
await shot("c_package_brain");
await shot("c_package_brain_full", true);
await el("anatomy", "p", "Worker Anatomy");
h = await el("buildPackage", "button", "Build Package");
await click(h, 900);
await shot("c_building");
await sleep(3400);
await shot("c_built");

// ---------- Packaging & delivery ----------
await go("/packaging", 1600, 900, 1500);
await shot("packaging");
await shot("packaging_full", true);
await go("/delivery", 1600, 900, 900);
await shot("delivery");
await shot("delivery_full", true);
await el("alreadyDelivered", "h2", "Already delivered");

// ---------- Registry (before any Accept, so evidence counts match the story order) ----------
await go("/workers", 1600, 900, 1600);
await shot("registry");
await el("wcard", "div", "Integration Modernization Worker", { contains: true, nth: 0 }).catch(() => null);
{
  const gold = await page.evaluateHandle(() => {
    const cards = [...document.querySelectorAll("div")].filter((d) => typeof d.className === "string" && d.className.includes("shadow-card") && d.innerText.includes("Integration Modernization Worker") && d.innerText.includes("View Worker"));
    const card = cards[cards.length - 1];
    return [...card.querySelectorAll("button")].find((b) => b.textContent.trim() === "Gold");
  });
  const r = await gold.boundingBox();
  meta.boxes.gold = { x: r.x, y: r.y, w: r.width, h: r.height };
  await gold.click();
  await page.mouse.move(1599, 899);
  await sleep(600);
  await page.screenshot({ path: OUT + "registry_popover.png" });
  meta.shots.registry_popover = { w: 1600, h: 900 };
  const pop = await page.$("[data-radix-popper-content-wrapper]");
  const p = await pop.boundingBox();
  meta.boxes.popover = { x: p.x, y: p.y, w: p.width, h: p.height };
}

// ---------- Learning graph (taller container so React Flow fits near 1x) ----------
{
  const p2 = await browser.newPage();
  await p2.evaluateOnNewDocument(() => {
    const s = document.createElement("style");
    s.textContent = `.h-\\[640px\\]{height:1200px !important}`;
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
  });
  await p2.setViewport({ width: 2320, height: 1700, deviceScaleFactor: 2 });
  await p2.goto(BASE + "/learning", { waitUntil: "networkidle0" });
  await p2.evaluate(() => document.fonts.ready);
  await sleep(3500);
  const g = await p2.evaluateHandle(() => {
    const el = [...document.querySelectorAll("div")].filter((d) => typeof d.className === "string" && d.className.includes("rounded-card") && d.className.includes("overflow-hidden") && d.querySelector(".react-flow"));
    return el[el.length - 1];
  });
  await g.evaluate((n) => n.scrollIntoView({ block: "start" }));
  await p2.mouse.move(0, 0);
  await sleep(800);
  await g.screenshot({ path: OUT + "graph.png" });
  meta.graph = await g.evaluate((g) => {
    const G = g.getBoundingClientRect();
    const rel = (r) => ({ x: r.x - G.x, y: r.y - G.y, w: r.width, h: r.height });
    return {
      size: { w: G.width, h: G.height },
      nodes: [...g.querySelectorAll(".react-flow__node")].map((n) => ({ text: n.innerText.replace(/\s+/g, " ").slice(0, 80), ...rel(n.getBoundingClientRect()) })),
    };
  });
  await p2.close();
}

// ---------- Sentinel review: before and after Accept ----------
await go("/sentinel", 1600, 900, 900);
await shot("sentinel");
await el("sentinelRow", "a", "CLIENT_ACKNOWLEDGE", { contains: true });
await go("/learning/candidates/cand-jms-ack", 1600, 900, 900);
await shot("review_before");
h = await el("accept", "button", "Accept");
await click(h, 700);
await shot("review_after");
await el("panel", "div", "now certified", { contains: true });
meta.boxes.panel = await page.evaluate(() => {
  const e = [...document.querySelectorAll("div")].filter((d) => typeof d.className === "string" && d.className.includes("sticky") && d.innerText.includes("now certified"))[0];
  const r = e.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

// ---------- Knowledge ----------
await go("/knowledge", 1600, 900, 900);
await shot("knowledge");
await el("chipDomain", "button", "Domain Language", { contains: true });
await el("rowTibco", "a", "TIBCO → Spring Boot migration", { contains: true });
meta.tibcoHref = await page.evaluate(() => document.querySelector('[data-cap="rowTibco"]').getAttribute("href"));
await go(meta.tibcoHref, 1600, 900, 1200);
await shot("knowledge_detail");
await shot("knowledge_detail_full", true);
for (const [k, t] of [["kCandidate", "Candidate knowledge"], ["kCertified", "Certified / published knowledge"], ["kWorkers", "Workers using this"]]) {
  await el(k, "p", t).catch((e) => console.error(e.message));
}

fs.writeFileSync(OUT + "meta.json", JSON.stringify(meta, null, 2));
await browser.close();
console.log(JSON.stringify(meta.boxes, null, 1));
