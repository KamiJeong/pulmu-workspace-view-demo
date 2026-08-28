import type { CSSProperties, ReactNode } from "react";

import { PULMU_STAGES } from "@pulmu/model";
import {
  chartPalette,
  stageTokens,
  tokenCatalog,
  type TokenCatalogEntry,
} from "@pulmu/tokens";

import "./TokenCatalog.css";

type PreviewKind =
  | "border"
  | "breakpoint"
  | "color"
  | "motion"
  | "opacity"
  | "radius"
  | "shadow"
  | "size"
  | "spacing"
  | "typography"
  | "z-index";

const getPreviewKind = ({ cssVar }: TokenCatalogEntry): PreviewKind => {
  if (
    cssVar.includes("color") ||
    cssVar.includes("chart-series") ||
    cssVar.endsWith("-background") ||
    cssVar.endsWith("-foreground")
  ) return "color";
  if (cssVar.includes("font") || cssVar.includes("line-height") || cssVar.includes("typography")) return "typography";
  if (cssVar.includes("radius")) return "radius";
  if (cssVar.includes("border")) return "border";
  if (cssVar.includes("shadow")) return "shadow";
  if (cssVar.includes("opacity")) return "opacity";
  if (cssVar.includes("z-")) return "z-index";
  if (cssVar.includes("breakpoint")) return "breakpoint";
  if (cssVar.includes("duration") || cssVar.includes("easing")) return "motion";
  if (cssVar.includes("space") || cssVar.includes("spacing") || cssVar.includes("density") || cssVar.includes("padding") || cssVar.includes("offset")) return "spacing";
  return "size";
};

const getTypographyVariant = ({ cssVar }: TokenCatalogEntry, previewKind: PreviewKind) => {
  if (previewKind !== "typography") return undefined;
  if (cssVar.includes("family")) return "family";
  if (cssVar.includes("font-size") || cssVar.includes("body-size")) return "size";
  if (cssVar.includes("weight")) return "weight";
  return "line-height";
};

const resolveCssVariable = (cssVar: string, fallback: string) => {
  if (typeof document === "undefined") return fallback;
  const styles = getComputedStyle(document.documentElement);
  let result = styles.getPropertyValue(cssVar).trim() || fallback;
  for (let depth = 0; depth < 6 && result.includes("var("); depth += 1) {
    result = result.replace(/var\((--pulmu-[^)]+)\)/g, (_, reference: string) =>
      styles.getPropertyValue(reference).trim() || reference,
    );
  }
  return result;
};

function TokenItem({ entry, label }: { entry: TokenCatalogEntry; label?: ReactNode }) {
  const resolvedValue = resolveCssVariable(entry.cssVar, entry.value);
  const previewKind = getPreviewKind(entry);
  const typographyVariant = getTypographyVariant(entry, previewKind);
  const sampleStyle = {
    "--token-sample-value": `var(${entry.cssVar})`,
  } as CSSProperties;

  return (
    <li className="token-card" data-token-layer={entry.layer}>
      <div className="token-card__heading">
        <span
          aria-hidden="true"
          className={`token-preview token-preview--${previewKind}`}
          data-token-preview={entry.cssVar}
          data-token-preview-kind={previewKind}
          data-token-preview-variant={typographyVariant}
          style={sampleStyle}
        >
          {previewKind === "typography" ? "Aa" : null}
          {previewKind === "spacing" ? <><i /><i /></> : null}
          {previewKind === "z-index" ? <><i /><i /></> : null}
          {previewKind === "motion" ? <><i /><i /><i /></> : null}
        </span>
        <strong>{label ?? entry.key.split(".").at(-1)}</strong>
      </div>
      <p>{entry.description}</p>
      <dl>
        <div><dt lang="en">TypeScript</dt><dd><code>{entry.key}</code></dd></div>
        <div><dt lang="en">CSS</dt><dd><code>{entry.cssVar}</code></dd></div>
        <div><dt lang="en">Resolved</dt><dd><code>{resolvedValue}</code></dd></div>
        <div><dt lang="en">Use</dt><dd>{entry.usage}</dd></div>
      </dl>
    </li>
  );
}

function TokenGrid({ entries, label }: { entries: readonly TokenCatalogEntry[]; label: string }) {
  return (
    <ul aria-label={label} className="token-grid" lang="en">
      {entries.map((entry) => <TokenItem entry={entry} key={entry.cssVar} />)}
    </ul>
  );
}

const semanticEntries = tokenCatalog.filter(({ layer }) => layer === "semantic");
const actionEntries = semanticEntries.filter(({ key }) => key.startsWith("semanticTokens.color.action"));
const lifecycleEntries = semanticEntries.filter(({ key }) => key.startsWith("semanticTokens.status."));
const stageEntries = PULMU_STAGES.map((stage) => ({
  entry: tokenCatalog.find(({ cssVar }) => cssVar === stageTokens[stage.id].cssVar)!,
  stage,
}));
const chartAndMotionEntries = semanticEntries.filter(({ key }) =>
  key.startsWith("semanticTokens.chart.") || key.startsWith("semanticTokens.motion."),
);
const foundationEntries = semanticEntries.filter(({ key }) =>
  !key.startsWith("semanticTokens.color.action") &&
  !key.startsWith("semanticTokens.status.") &&
  !key.startsWith("semanticTokens.stage.") &&
  !key.startsWith("semanticTokens.chart.") &&
  !key.startsWith("semanticTokens.motion."),
);
const primitiveEntries = tokenCatalog.filter(({ layer }) => layer === "primitive");
const componentEntries = tokenCatalog.filter(({ layer }) => layer === "component");

export function TokenCatalog() {
  return (
    <main className="token-catalog" lang="ko">
      <header className="token-catalog__intro">
        <p className="token-catalog__eyebrow">Pulmu Design System v0.1</p>
        <h1 lang="en">Token catalog</h1>
        <p>
          Dark-first 인터페이스를 위한 primitive → semantic → component 계약이다. TypeScript에서는
          <code>@pulmu/tokens</code> registry를, CSS에서는 같은 항목의 <code>--pulmu-*</code> custom property를 사용한다.
        </p>
        <p className="token-catalog__scope">
          이 범위는 기본 dark theme와 Storybook toolbar 호환용 light preview를 제공한다. 완성된 light/high-contrast theme,
          전체 component styling, brand redesign은 포함하지 않는다.
        </p>
        <nav aria-label="Token catalog sections" lang="en">
          <a href="#semantic-foundations">Semantic</a>
          <a href="#workflow-colors">Workflow</a>
          <a href="#chart-motion">Chart &amp; motion</a>
          <a href="#primitives">Primitives</a>
          <a href="#component-aliases">Components</a>
        </nav>
      </header>

      <section aria-labelledby="semantic-foundations-heading" id="semantic-foundations">
        <h2 id="semantic-foundations-heading" lang="en">Semantic foundations and contrast</h2>
        <p>
          기본 surface는 canvas <code>#121212</code>, surface <code>#1d1d1d</code>, elevated <code>#292929</code> 순으로 밝아진다.
          Primary와 muted normal text는 각 surface에서 4.5:1 이상, meaningful boundary와 focus ring은 인접 surface에서
          3:1 이상을 검증한다. Large text는 24px regular 또는 약 18.66px bold 이상에서 3:1, 그보다 작으면 normal text
          기준 4.5:1을 적용한다.
        </p>
        <div className="token-catalog__contrast" role="note">
          <strong>검증 결과:</strong> primary/canvas 17.5:1 · muted/default surface 8.6:1 · boundary/elevated 3.2:1 ·
          focus/canvas 10.7:1. UI boundary는 <code>border.default</code>를 사용하며 더 낮은 임의 neutral을 쓰지 않는다.
        </div>
        <TokenGrid entries={foundationEntries} label="Semantic foundation tokens" />
      </section>

      <section aria-labelledby="workflow-colors-heading" id="workflow-colors">
        <h2 id="workflow-colors-heading" lang="en">Action, status, and canonical stages</h2>
        <p>Action, lifecycle status, forge stage는 서로 다른 namespace다. 색은 반드시 text/icon/name과 함께 사용한다.</p>
        <h3 lang="en">Action</h3>
        <TokenGrid entries={actionEntries} label="Action tokens" />
        <h3 lang="en">Run and stage lifecycle status</h3>
        <TokenGrid entries={lifecycleEntries} label="Lifecycle status tokens" />
        <h3 lang="en">Seven forge stages</h3>
        <ul aria-label="Canonical stage tokens" className="token-grid" data-testid="stage-token-list" lang="en">
          {stageEntries.map(({ entry, stage }) => (
            <TokenItem entry={entry} key={stage.id} label={`${stage.icon} ${stage.name}`} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="chart-motion-heading" id="chart-motion">
        <h2 id="chart-motion-heading" lang="en">Chart palette and motion</h2>
        <p>
          Chart palette의 각 색은 dark canvas에서 3:1 이상이다. 범례 label을 항상 제공하고, 인접 series는 색과 함께
          stroke dash와 point shape를 바꿔 구분한다. 색만으로 값을 전달하지 않는다.
        </p>
        <div aria-label="Chart series differentiation table" className="token-catalog__table-wrap" lang="en" role="region" tabIndex={0}>
          <table lang="en">
            <caption>Chart series differentiation contract</caption>
            <thead><tr><th scope="col">Label</th><th scope="col">CSS variable</th><th scope="col">Stroke</th><th scope="col">Point</th></tr></thead>
            <tbody>
              {chartPalette.map((series) => (
                <tr key={series.cssVar}>
                  <th scope="row">{series.label}</th><td><code>{series.cssVar}</code></td><td>{series.dash}</td><td>{series.pointShape}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Reduced motion에서는 <code>prefers-reduced-motion: reduce</code>와 <code>data-motion=&quot;reduced&quot;</code>가
          semantic duration을 instant로 바꾸며 비필수 animation과 transition을 억제한다.
        </p>
        <TokenGrid entries={chartAndMotionEntries} label="Chart and motion tokens" />
      </section>

      <section aria-labelledby="primitives-heading" id="primitives">
        <h2 id="primitives-heading" lang="en">Primitive scale</h2>
        <p>Primitive는 literal 값이다. 제품 UI에서 직접 고르지 않고 semantic token을 통해 소비한다.</p>
        <TokenGrid entries={primitiveEntries} label="Primitive tokens" />
      </section>

      <section aria-labelledby="component-aliases-heading" id="component-aliases">
        <h2 id="component-aliases-heading" lang="en">Component aliases and consumption</h2>
        <p>Component alias는 semantic contract만 참조하며 Tailwind 없이 독립적으로 동작한다.</p>
        <pre aria-label="Token consumption example" lang="en" tabIndex={0}><code>{`import { semanticTokens } from "@pulmu/tokens";\nimport "@pulmu/tokens/global.css";\n\nconst canvasVariable = semanticTokens.color.canvas.cssVar;\n// CSS: background: var(--pulmu-color-surface-canvas);`}</code></pre>
        <TokenGrid entries={componentEntries} label="Component alias tokens" />
        <aside className="token-catalog__rule" aria-labelledby="arbitrary-rule-heading">
          <h3 id="arbitrary-rule-heading" lang="en">No arbitrary values</h3>
          <p>
            Source와 Storybook에서 임의 color·spacing literal 또는 Tailwind arbitrary value를 추가하지 않는다. 먼저 적절한
            semantic token을 재사용하고, 의미가 없을 때만 이 package에 primitive → semantic → component 순서로 추가한다.
            Tailwind를 쓰는 consumer도 config에서 이 CSS/TypeScript 계약을 참조해야 하며 token package 자체는 Tailwind에
            의존하지 않는다.
          </p>
        </aside>
      </section>
    </main>
  );
}
