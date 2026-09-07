/* global HTMLElement, URL, clearTimeout, console, document, getComputedStyle, process, requestAnimationFrame, setTimeout */

import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

import axe from "axe-core";
import { chromium } from "playwright";

import { compareThemeParity } from "./audit-parity.mjs";
import { storyAuditManifest } from "../src/audit/storyAuditManifest.mjs";

const root = resolve(import.meta.dirname, "../../..");
const staticRoot = join(root, "storybook-static");
const reportDirectory = join(root, "test-results", "component-audit");
const viewports = [
  { height: 900, name: "desktop", width: 1440 },
  { height: 1024, name: "tablet", width: 768 },
  { height: 844, name: "mobile", width: 390 },
  { height: 720, name: "narrow", width: 320 },
];
const themes = ["light", "dark"];
const combinationTimeoutMs = 30_000;
const mime = new Map([
  [".css", "text/css"], [".html", "text/html"], [".js", "text/javascript"], [".json", "application/json"],
  [".mjs", "text/javascript"], [".png", "image/png"], [".svg", "image/svg+xml"], [".woff2", "font/woff2"],
]);

class AuditTimeoutError extends Error {}

async function withTimeout(promise, milliseconds, message) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new AuditTimeoutError(message)), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function validateInventory(index) {
  const built = Object.values(index.entries).filter(({ type }) => type === "story");
  const duplicates = storyAuditManifest.filter((entry, index) => storyAuditManifest.findIndex(({ id }) => id === entry.id) !== index);
  const expected = new Map(storyAuditManifest.map((entry) => [entry.id, entry]));
  const actual = new Map(built.map((entry) => [entry.id, entry]));
  const errors = [];
  if (duplicates.length) errors.push(`duplicate manifest IDs: ${duplicates.map(({ id }) => id).join(", ")}`);
  for (const entry of storyAuditManifest) {
    const builtEntry = actual.get(entry.id);
    if (!builtEntry) errors.push(`missing built story: ${entry.id}`);
    else {
      for (const key of ["title", "name"]) if (builtEntry[key] !== entry[key]) errors.push(`${entry.id} ${key}: expected ${JSON.stringify(entry[key])}, received ${JSON.stringify(builtEntry[key])}`);
      if (builtEntry.importPath !== entry.source) errors.push(`${entry.id} source: expected ${entry.source}, received ${builtEntry.importPath}`);
    }
    if (!entry.category || !entry.applicableStates.length || !entry.note || !entry.status) errors.push(`incomplete manifest entry: ${entry.id}`);
  }
  for (const entry of built) if (!expected.has(entry.id)) errors.push(`extra built story: ${entry.id}`);
  if (errors.length) throw new Error(`Story inventory mismatch (${built.length} built, ${storyAuditManifest.length} mapped)\n${errors.join("\n")}`);
  return storyAuditManifest;
}

function startServer() {
  const server = createServer((request, response) => {
    const rawPath = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const relativePath = rawPath === "/" ? "index.html" : normalize(decodeURIComponent(rawPath)).replace(/^[/\\]+/, "");
    const filePath = join(staticRoot, relativePath);
    if (!filePath.startsWith(`${staticRoot}/`) || !existsSync(filePath)) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.setHeader("content-type", mime.get(extname(filePath)) ?? "application/octet-stream");
    createReadStream(filePath).on("error", () => response.writeHead(500).end("Read error")).pipe(response);
  });
  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

async function auditCombination(page, entry, theme, viewport) {
  await page.setViewportSize({ height: viewport.height, width: viewport.width });
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  const diagnostic = `${entry.id} · ${theme} · ${viewport.width}px`;
  const evaluation = page.evaluate(async ({ expectedTheme, axeSource }) => {
    const storyRoot = document.querySelector("#storybook-root");
    if (!storyRoot || !storyRoot.textContent?.trim() && !storyRoot.querySelector("svg, input, progress, [role], [aria-label]")) throw new Error("Story root is empty");
    let auditStyle = document.querySelector("#pulmu-component-audit-style");
    if (!auditStyle) {
      auditStyle = document.createElement("style");
      auditStyle.id = "pulmu-component-audit-style";
      auditStyle.textContent = "*,*::before,*::after{animation:none!important;scroll-behavior:auto!important;transition:none!important}";
      document.head.append(auditStyle);
    }
    document.documentElement.dataset.motion = "reduced";
    getComputedStyle(document.documentElement).getPropertyValue("--pulmu-motion-duration-fast");
    document.documentElement.dataset.theme = expectedTheme;
    document.documentElement.style.colorScheme = expectedTheme;
    await document.fonts.ready;
    await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
    for (const animation of document.getAnimations()) animation.cancel();
    await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
    const unsettledAnimations = document.getAnimations()
      .filter(({ pending, playState }) => pending || ["running", "paused"].includes(playState))
      .map(({ animationName, playState }) => `${animationName || "anonymous"}:${playState}`)
      .slice(0, 5);
    if (unsettledAnimations.length) throw new Error(`animations did not settle: ${unsettledAnimations.join(", ")}`);
    if (!globalThis.axe) Function(axeSource)();
    const styles = getComputedStyle(document.documentElement);
    const accessibility = await globalThis.axe.run(storyRoot, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
    const overflow = [
      ["document", document.documentElement.scrollWidth, document.documentElement.clientWidth, Math.round(document.documentElement.getBoundingClientRect().width)],
      ["body", document.body.scrollWidth, document.body.clientWidth, Math.round(document.body.getBoundingClientRect().width)],
      ["story root", storyRoot.scrollWidth, storyRoot.clientWidth, Math.round(storyRoot.getBoundingClientRect().width)],
    ].filter(([, scrollWidth, clientWidth]) => scrollWidth > clientWidth + 1);
    const horizontalScrollers = [...storyRoot.querySelectorAll("*")].filter((element) => {
      if (!(element instanceof HTMLElement) || element.scrollWidth <= element.clientWidth + 1) return false;
      const overflowX = getComputedStyle(element).overflowX;
      return ["auto", "scroll"].includes(overflowX);
    });
    const invalidScrollers = horizontalScrollers.filter((element) => {
      const hasName = Boolean(element.getAttribute("aria-label") || element.getAttribute("aria-labelledby"));
      const hasKeyboardTarget = element.getAttribute("tabindex") === "0" || Boolean(element.querySelector('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'));
      return !hasName || !hasKeyboardTarget;
    }).map((element) => element.className || element.tagName).slice(0, 5);
    const rootBounds = storyRoot.getBoundingClientRect();
    const escapedLandmarks = [...storyRoot.querySelectorAll("main, section, article, header, footer, nav, form")].filter((element) => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height || element.closest('[hidden], [aria-hidden="true"]')) return false;
      if (horizontalScrollers.some((scroller) => scroller.contains(element))) return false;
      return bounds.left < rootBounds.left - 1 || bounds.right > rootBounds.right + 1;
    }).map((element) => element.className || element.tagName).slice(0, 5);
    const clippedLandmarks = [...storyRoot.querySelectorAll("main, section, article, form")].filter((element) => {
      if (!(element instanceof HTMLElement) || element.scrollWidth <= element.clientWidth + 1) return false;
      return ["hidden", "clip"].includes(getComputedStyle(element).overflowX);
    }).map((element) => element.className || element.tagName).slice(0, 5);
    const viewportEscapes = [...storyRoot.querySelectorAll("*")].filter((element) => {
      if (!(element instanceof HTMLElement) || element.closest('[hidden], [aria-hidden="true"]')) return false;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height || bounds.left >= -1 && bounds.right <= document.documentElement.clientWidth + 1) return false;
      return !horizontalScrollers.some((scroller) => scroller.contains(element));
    }).map((element) => `${element.className || element.tagName}[${Math.round(element.getBoundingClientRect().left)},${Math.round(element.getBoundingClientRect().right)}]`).slice(0, 5);
    const controlStates = [...storyRoot.querySelectorAll('a[href], button, details, input, option, progress, select, summary, textarea, [role="button"], [role="checkbox"], [role="link"], [role="menuitem"], [role="option"], [role="radio"], [role="slider"], [role="switch"], [role="tab"]')]
      .filter((element) => !element.closest('[hidden], [aria-hidden="true"]') && getComputedStyle(element).display !== "none" && getComputedStyle(element).visibility !== "hidden")
      .map((element, index) => {
        const field = element;
        const name = (element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim();
        const state = {
          busy: element.getAttribute("aria-busy"),
          checked: "checked" in field ? field.checked : element.getAttribute("aria-checked"),
          current: element.getAttribute("aria-current"),
          disabled: "disabled" in field ? field.disabled : element.getAttribute("aria-disabled"),
          expanded: element.getAttribute("aria-expanded"),
          open: "open" in field ? field.open : null,
          pressed: element.getAttribute("aria-pressed"),
          selected: "selected" in field ? field.selected : element.getAttribute("aria-selected"),
          value: "value" in field && field.type !== "password" ? field.value : element.getAttribute("aria-valuenow"),
        };
        return `${index}|${element.tagName.toLowerCase()}|${element.getAttribute("role") ?? ""}|${name}|${JSON.stringify(state)}`;
      });
    return {
      colorScheme: styles.colorScheme,
      datasetTheme: document.documentElement.dataset.theme,
      overflow,
      semanticTheme: ["--pulmu-color-surface-canvas", "--pulmu-color-text-primary", "--pulmu-color-border-default", "--pulmu-color-brand-default"].map((name) => styles.getPropertyValue(name).trim()),
      clippedLandmarks,
      escapedLandmarks,
      invalidScrollers,
      parityEvidence: {
        controlStates,
        visibleText: storyRoot.innerText.replace(/\s+/g, " ").trim(),
      },
      viewportEscapes,
      violations: accessibility.violations.map(({ id, impact, nodes }) => ({
        id, impact, nodes: nodes.length,
        samples: nodes.slice(0, 3).map(({ failureSummary, target }) => ({ failureSummary, target })),
      })),
    };
  }, { axeSource: axe.source, expectedTheme: theme });
  let result;
  try {
    result = await withTimeout(evaluation, combinationTimeoutMs, `${diagnostic}: audit timed out after ${combinationTimeoutMs}ms`);
  } catch (error) {
    if (error instanceof AuditTimeoutError) throw error;
    throw new Error(`${diagnostic}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  const problems = [];
  if (result.datasetTheme !== theme) problems.push(`data-theme is ${result.datasetTheme ?? "missing"}`);
  if (result.colorScheme !== theme) problems.push(`computed color-scheme is ${result.colorScheme}`);
  if (result.semanticTheme.some((value) => !value)) problems.push("semantic theme values are empty");
  if (result.overflow.length) problems.push(`root overflow: ${result.overflow.map(([name, scroll, client, bounds]) => `${name} ${scroll}>${client} (bounds ${bounds})`).join(", ")}`);
  if (result.invalidScrollers.length) problems.push(`horizontal scrollers need an accessible name and tabindex=0: ${result.invalidScrollers.join(", ")}`);
  if (result.escapedLandmarks.length) problems.push(`landmarks escape the story root: ${result.escapedLandmarks.join(", ")}`);
  if (result.clippedLandmarks.length) problems.push(`landmarks clip horizontal content: ${result.clippedLandmarks.join(", ")}`);
  if (result.viewportEscapes.length) problems.push(`elements escape the viewport: ${result.viewportEscapes.join(", ")}`);
  if (result.violations.length) problems.push(`axe: ${result.violations.map(({ id, impact, nodes, samples }) => `${id}(${impact}, ${nodes}, ${samples[0]?.target.join(" ")}: ${samples[0]?.failureSummary?.replaceAll("\n", " ")})`).join(", ")}`);
  if (problems.length) throw new Error(`${diagnostic}: ${problems.join("; ")}`);
  if (entry.id === "08-agent-components-agent-surfaces--narrow-long-agent-names" && viewport.name === "narrow") {
    await page.screenshot({ fullPage: true, path: join(reportDirectory, `orchestration-flow-${theme}-320.png`) });
  }
  return {
    parityEvidence: {
      ...result.parityEvidence,
      accessibleSnapshot: (await page.locator("#storybook-root").ariaSnapshot()).trim(),
    },
    semanticTheme: result.semanticTheme.join("|"),
  };
}

async function auditStory(page, baseUrl, entry) {
  const browserErrors = [];
  const onPageError = (error) => browserErrors.push(error.message);
  page.on("pageerror", onPageError);
  try {
    await page.goto(`${baseUrl}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=story&embed=true&globals=motion:reduced`, { waitUntil: "networkidle" });
    const storyRoot = page.locator("#storybook-root");
    await storyRoot.waitFor({ state: "visible" });
    await page.waitForFunction(() => Boolean(document.querySelector("#storybook-root")?.innerHTML.trim()));
    const renderError = page.locator("#error-message, .sb-errordisplay, [data-test-id=storyRenderError]");
    const visibleRenderErrors = [];
    for (let index = 0; index < await renderError.count(); index += 1) {
      const candidate = renderError.nth(index);
      if (await candidate.isVisible()) visibleRenderErrors.push((await candidate.innerText()).trim());
    }
    if (visibleRenderErrors.length) throw new Error(`${entry.id}: Storybook render error: ${visibleRenderErrors.join(" ")}`);
    const themeEvidence = new Map();
    const results = { attempted: 0, failures: [], parityAttempted: 0, parityFailures: [], parityPassed: 0, passed: 0 };
    for (const viewport of viewports) {
      for (const theme of themes) {
        results.attempted += 1;
        try {
          themeEvidence.set(`${viewport.name}:${theme}`, await auditCombination(page, entry, theme, viewport));
          results.passed += 1;
        } catch (error) {
          if (error instanceof AuditTimeoutError) throw error;
          results.failures.push(error instanceof Error ? error.message : String(error));
        }
      }
      const light = themeEvidence.get(`${viewport.name}:light`);
      const dark = themeEvidence.get(`${viewport.name}:dark`);
      if (light && dark) {
        results.parityAttempted += 1;
        const parityProblems = compareThemeParity(
          light.parityEvidence,
          dark.parityEvidence,
          entry.parityAllowances?.[viewport.name] ?? [],
        );
        if (light.semanticTheme === dark.semanticTheme) parityProblems.unshift("semantic values are identical");
        if (parityProblems.length) {
          results.parityFailures.push(`${entry.id} · ${viewport.width}px: ${parityProblems.join("; ")}`);
        } else {
          results.parityPassed += 1;
        }
      }
    }
    if (browserErrors.length) results.failures.push(`${entry.id}: browser errors: ${browserErrors.join("; ")}`);
    return results;
  } finally {
    page.off("pageerror", onPageError);
  }
}

async function main() {
  if (!existsSync(join(staticRoot, "index.json"))) throw new Error("storybook-static/index.json is missing; run `bun run build` first");
  const index = JSON.parse(await readFile(join(staticRoot, "index.json"), "utf8"));
  const inventory = validateInventory(index);
  const requestedStory = process.argv[2];
  const stories = requestedStory ? inventory.filter(({ id }) => id === requestedStory) : inventory;
  if (!stories.length) throw new Error(`Unknown story filter: ${requestedStory}`);
  await mkdir(reportDirectory, { recursive: true });
  const server = await startServer();
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const loadFailures = [];
  const parityFailures = [];
  let attempted = 0;
  let completed = 0;
  let passed = 0;
  let parityAttempted = 0;
  let parityPassed = 0;
  let nextIndex = 0;
  try {
    const workers = Array.from({ length: 3 }, async () => {
      let page = await browser.newPage();
      while (nextIndex < stories.length) {
        const entry = stories[nextIndex++];
        try {
          const result = await auditStory(page, baseUrl, entry);
          attempted += result.attempted;
          passed += result.passed;
          failures.push(...result.failures);
          parityAttempted += result.parityAttempted;
          parityPassed += result.parityPassed;
          parityFailures.push(...result.parityFailures);
        } catch (error) {
          loadFailures.push(error instanceof Error ? error.message : String(error));
          await page.close();
          page = await browser.newPage();
        }
        completed += 1;
        if (completed % 10 === 0 || completed === stories.length) console.log(`Audited ${completed}/${stories.length} stories`);
      }
      await page.close();
    });
    await Promise.all(workers);
  } finally {
    await browser.close();
    await new Promise((resolveClose) => server.close(resolveClose));
  }
  const report = {
    combinations: { attempted, failed: attempted - passed, passed, planned: stories.length * themes.length * viewports.length },
    failures: failures.sort(),
    loadFailures: loadFailures.sort(),
    parity: { attempted: parityAttempted, failed: parityAttempted - parityPassed, passed: parityPassed, planned: stories.length * viewports.length },
    parityFailures: parityFailures.sort(),
    stories: stories.map(({ id }) => id).sort(),
    summary: { auditedStories: stories.length - loadFailures.length, missingCapabilities: 2, themes: themes.length, viewports: viewports.length },
  };
  await writeFile(join(reportDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (failures.length || parityFailures.length || loadFailures.length || attempted !== report.combinations.planned || passed !== attempted || parityAttempted !== report.parity.planned || parityPassed !== parityAttempted) throw new Error(`Component audit failed (${failures.length} combinations, ${parityFailures.length} parity checks, ${loadFailures.length} story loads)\n${[...loadFailures, ...failures, ...parityFailures].join("\n")}`);
  console.log(`Component audit PASS: ${stories.length} stories × ${themes.length} themes × ${viewports.length} viewports = ${attempted} combinations; ${parityAttempted} Light/Dark parity checks`);
  console.log(`Report: ${join(reportDirectory, "report.json")}`);
}

await main();
