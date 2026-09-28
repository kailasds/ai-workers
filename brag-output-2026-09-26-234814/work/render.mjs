import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import ffmpegPath from "ffmpeg-static";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const DURATION = 60.0;

const meta = fs.readFileSync(path.join(DIR, "cap/meta.json"), "utf8");

const html = fs.readFileSync(path.join(DIR, "comp.html"), "utf8").replace("__META__", meta);
const built = path.join(DIR, "comp.built.html");
fs.writeFileSync(built, html);

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--font-render-hinting=none", "--allow-file-access-from-files"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(built).href, { waitUntil: "networkidle0" });
await page.evaluate(() => window.ready);

const stillsArg = process.argv.find((a) => a.startsWith("--stills="));
if (stillsArg) {
  const out = path.join(DIR, "stills");
  fs.mkdirSync(out, { recursive: true });
  for (const t of stillsArg.slice(9).split(",").map(Number)) {
    await page.evaluate((t) => window.renderAt(t), t);
    await page.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(5, "0")}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const outFile = path.join(DIR, "video.mp4");
const ff = spawn(ffmpegPath, ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outFile], { stdio: ["pipe", "inherit", "pipe"] });
let ffErr = "";
ff.stderr.on("data", (d) => (ffErr += d));
const frames = Math.round(DURATION * FPS);
const started = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.renderAt(t), f / FPS);
  const buf = await page.screenshot({ type: "png", optimizeForSpeed: true });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 60 === 0) console.log(`frame ${f}/${frames} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
}
ff.stdin.end();
const code = await new Promise((r) => ff.on("close", r));
await browser.close();
if (code !== 0) { console.error(ffErr.slice(-2000)); process.exit(code); }
console.log("wrote", outFile);
