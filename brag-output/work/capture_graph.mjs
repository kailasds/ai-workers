import puppeteer from "puppeteer-core";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE || "http://localhost:55977";
const OUT = fileURLToPath(new URL("./cap/", import.meta.url));

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--font-render-hinting=none"],
});
const page = await browser.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A taller graph container makes React Flow's own fitView land near 1x zoom, so node text is legible when the camera pushes in.
await page.evaluateOnNewDocument(() => {
  const s = document.createElement("style");
  s.textContent = `.h-\\[640px\\]{height:${1200}px !important}`;
  document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
});
await page.setViewport({ width: 2320, height: 1700, deviceScaleFactor: 2 });
await page.goto(BASE + "/learning", { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await sleep(3500);

const handle = await page.evaluateHandle(() => {
  const el = [...document.querySelectorAll("div")].filter((d) => typeof d.className === "string" && d.className.includes("rounded-card") && d.className.includes("overflow-hidden") && d.querySelector(".react-flow"));
  return el[el.length - 1];
});
await handle.evaluate((n) => n.scrollIntoView({ block: "start" }));
await page.mouse.move(0, 0);
await sleep(800);
await handle.screenshot({ path: OUT + "graph_big.png" });

const meta = await handle.evaluate((g) => {
  const G = g.getBoundingClientRect();
  const rel = (r) => ({ x: r.x - G.x, y: r.y - G.y, w: r.width, h: r.height });
  const stageNames = ["Workers", "Topics", "Knowledge", "Candidate Knowledge", "Certified Knowledge", "Knowledge Packs"];
  const stages = [...g.querySelectorAll("span")]
    .filter((s) => stageNames.includes(s.textContent.trim()) && s.className.includes("uppercase"))
    .map((s) => ({ text: s.textContent.trim(), ...rel(s.getBoundingClientRect()) }));
  const strip = stages.length ? rel(g.querySelector("span.uppercase").closest("div.flex.items-center.gap-1\\.5.border-b").getBoundingClientRect()) : null;
  const nodes = [...g.querySelectorAll(".react-flow__node")].map((n) => ({ text: n.innerText.replace(/\s+/g, " ").slice(0, 80), ...rel(n.getBoundingClientRect()) }));
  return { size: { w: G.width, h: G.height }, strip, stages, nodes };
});
fs.writeFileSync(OUT + "graph_meta.json", JSON.stringify(meta, null, 2));
await browser.close();
console.log("size", meta.size, "strip", meta.strip);
for (const s of meta.stages) console.log("stage", s.text, Math.round(s.x), Math.round(s.y), Math.round(s.w));
for (const n of meta.nodes) console.log(Math.round(n.x), Math.round(n.y), Math.round(n.w), Math.round(n.h), n.text.slice(0, 60));
