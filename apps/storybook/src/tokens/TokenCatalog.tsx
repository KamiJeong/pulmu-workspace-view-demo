import type { CSSProperties, ReactNode } from "react";

import { PULMU_STAGES } from "@pulmu/model";
import {
  chartPalette,
  ironAndEmberPalettes,
  stageStatusTokens,
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
  if (cssVar.includes("size")) return "size";
  if (cssVar.includes("weight")) return "weight";
  if (cssVar.includes("variant-numeric")) return "numeric";
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

const paletteLabels = {
  canvas: "Canvas",
  surface: "Surface",
  surfaceSubtle: "Surface subtle",
  surfaceHover: "Surface hover",
  border: "Border",
  borderStrong: "Border strong",
  textPrimary: "Text primary",
  textSecondary: "Text secondary",
  textMuted: "Text muted",
  brand: "Brand",
  brandHover: "Brand hover",
  brandSoft: "Brand soft",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  info: "Info",
} as const;

function Palette({ theme }: { theme: keyof typeof ironAndEmberPalettes }) {
  return (
    <article className="theme-palette" data-palette-theme={theme}>
      <h3 lang="en">{theme === "light" ? "Ivory / Light" : "Coal / Dark"}</h3>
      <ul aria-label={`${theme} theme palette`} lang="en">
        {Object.entries(ironAndEmberPalettes[theme]).map(([role, value]) => (
          <li key={role}>
            <span
              aria-hidden="true"
              className="theme-palette__swatch"
              style={{ "--palette-color": value } as CSSProperties}
            />
            <span>{paletteLabels[role as keyof typeof paletteLabels]}</span>
            <code>{value}</code>
          </li>
        ))}
      </ul>
    </article>
  );
}

const semanticEntries = tokenCatalog.filter(({ layer }) => layer === "semantic");
const lifecycleEntries = semanticEntries.filter(({ key }) => key.startsWith("semanticTokens.status."));
const stageEntries = PULMU_STAGES.map((stage) => ({
  entry: tokenCatalog.find(({ cssVar }) => cssVar === stageTokens[stage.id].cssVar)!,
  stage,
}));
const chartAndMotionEntries = semanticEntries.filter(({ key }) =>
  key.startsWith("semanticTokens.chart.") || key.startsWith("semanticTokens.motion."),
);
const foundationEntries = semanticEntries.filter(({ key }) =>
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
        <p className="token-catalog__eyebrow">Pulmu Design System · Iron &amp; Ember</p>
        <h1 lang="en">Iron &amp; Ember color tokens</h1>
        <p>
          Iron은 신뢰할 수 있는 구조, Steel은 neutral UI foundation, Coal은 dark mode, Ember는 Pulmu의 제한된
          brand accent, Ivory는 편안한 light canvas를 뜻한다. 실제 제품 UI는 장식적인 대장간 표현보다 현대적인
          Developer Tool의 밀도와 가독성을 우선한다.
        </p>
        <p className="token-catalog__scope">
          Neutral을 기본으로 하고 Ember는 logo, primary CTA, selected/focus, 현재 Forge stage에만 제한한다. Purple-blue
          gradient, neon, glow, glass, metal texture와 stage별 rainbow identity는 사용하지 않는다. 색은 항상 text, icon,
          pattern 또는 shape와 함께 전달한다.
        </p>
        <nav aria-label="Token catalog sections" lang="en">
          <a href="#theme-palettes">Palettes</a>
          <a href="#semantic-foundations">Semantic roles</a>
          <a href="#workflow-colors">Lifecycle</a>
          <a href="#chart-motion">Charts</a>
          <a href="#component-aliases">Compatibility</a>
        </nav>
      </header>

      <section aria-labelledby="theme-palettes-heading" id="theme-palettes">
        <h2 id="theme-palettes-heading" lang="en">Light and Dark source palettes</h2>
        <p>
          두 theme는 같은 semantic role을 공유하지만 독립된 palette로 설계한다. 아래 hex는 source palette 검증용이며,
          component에서는 literal이나 primitive 대신 semantic custom property를 사용한다.
        </p>
        <div className="theme-palettes">
          <Palette theme="light" />
          <Palette theme="dark" />
        </div>
      </section>

      <section aria-labelledby="semantic-foundations-heading" id="semantic-foundations">
        <h2 id="semantic-foundations-heading" lang="en">Semantic roles and contrast</h2>
        <p>
          Primary, secondary와 기존 <code>text-muted</code> alias는 모든 기본 surface에서 4.5:1 이상을 검증한다. Source
          palette의 muted literal은 이 기준보다 낮으므로 장식적인 de-emphasis에만 쓰고, visible text에는 접근성 companion을
          거치는 semantic token을 사용한다. 필수 설명에는 <code>text-secondary</code>를 우선한다.
        </p>
        <div className="token-catalog__contrast" role="note">
          <strong>Contrast contract:</strong> supplied <code>border</code>/<code>border-strong</code>은 subtle hierarchy용이다.
          경계선 하나만으로 control을 식별해야 할 때는 3:1을 검증한 <code>border-interactive</code>를 사용한다. Status
          accent도 일반 본문색으로 쓰지 않고, badge는 대응하는 <code>*-foreground</code> + <code>*-subtle</code> 쌍을 사용한다.
          Light의 source Ember는 white normal text와 4.5:1이 아니므로 primary action fill은 더 깊은 accessible Ember alias를 쓴다.
        </div>
        <TokenGrid entries={foundationEntries} label="Semantic foundation tokens" />
      </section>

      <section aria-labelledby="workflow-colors-heading" id="workflow-colors">
        <h2 id="workflow-colors-heading" lang="en">Forge lifecycle mapping</h2>
        <p>
          Forge stage의 이름은 색으로 구분하지 않는다. Pending은 muted, Current는 Ember, Completed는 success,
          Failed는 danger, Interrupted는 warning으로 표현하며 label과 icon 상태를 항상 함께 제공한다.
        </p>
        <dl className="lifecycle-map" lang="en">
          <div><dt>Pending</dt><dd><code>{stageStatusTokens.pending.cssVar}</code></dd></div>
          <div><dt>Current</dt><dd><code>{stageStatusTokens.in_progress.cssVar}</code></dd></div>
          <div><dt>Completed</dt><dd><code>{stageStatusTokens.completed.cssVar}</code></dd></div>
          <div><dt>Failed</dt><dd><code>{stageStatusTokens.failed.cssVar}</code></dd></div>
          <div><dt>Interrupted</dt><dd><code>{stageStatusTokens.interrupted.cssVar}</code></dd></div>
        </dl>
        <h3 lang="en">Run and stage status aliases</h3>
        <TokenGrid entries={lifecycleEntries} label="Lifecycle status tokens" />
        <h3 lang="en">Deprecated stage identity aliases</h3>
        <p>
          기존 일곱 CSS variable과 TypeScript export는 호환성을 위해 유지되지만 모두 neutral secondary text로 resolve한다.
          새 UI는 stage identity alias 대신 lifecycle status token을 사용한다.
        </p>
        <ul aria-label="Canonical stage tokens" className="token-grid" data-testid="stage-token-list" lang="en">
          {stageEntries.map(({ entry, stage }) => (
            <TokenItem entry={entry} key={stage.id} label={`${stage.icon} ${stage.name}`} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="chart-motion-heading" id="chart-motion">
        <h2 id="chart-motion-heading" lang="en">Theme-aware charts</h2>
        <p>
          각 series는 Light와 Dark canvas에서 3:1 이상이다. Ember는 primary highlight 하나에만 배치하고, purple이나 neon을
          primary로 쓰지 않는다. 범례 label, stroke dash, point shape를 함께 바꿔 색각 차이와 forced-colors 환경을 보완한다.
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

      <section aria-labelledby="component-aliases-heading" id="component-aliases">
        <h2 id="component-aliases-heading" lang="en">Compatibility and consumption</h2>
        <p>
          기존 public registry와 CSS variable은 유지된다. <code>surfaceElevated</code>는 <code>surfaceSubtle</code> alias로,
          stage identity color는 neutral alias로 남는다. Component alias는 semantic contract만 참조한다.
        </p>
        <pre aria-label="Token consumption example" lang="en" tabIndex={0}><code>{`import { ironAndEmberPalettes, semanticTokens } from "@pulmu/tokens";\nimport "@pulmu/tokens/global.css";\n\nconst canvasVariable = semanticTokens.color.canvas.cssVar;\nconst currentStageVariable = semanticTokens.status.stage.in_progress.cssVar;\n// CSS: background: var(--pulmu-color-surface-canvas);`}</code></pre>
        <TokenGrid entries={componentEntries} label="Component alias tokens" />
        <h3 lang="en">Primitive registry</h3>
        <p>Primitive는 literal 값이다. 문서와 tooling에서만 직접 보고 제품 UI에서는 semantic token을 통해 소비한다.</p>
        <TokenGrid entries={primitiveEntries} label="Primitive tokens" />
        <aside className="token-catalog__rule" aria-labelledby="arbitrary-rule-heading">
          <h3 id="arbitrary-rule-heading" lang="en">No arbitrary values</h3>
          <p>
            제품 styling과 Storybook catalog layout에 임의 color·spacing literal 또는 Tailwind arbitrary value를 추가하지
            않는다. 먼저 적절한 semantic token을 재사용하고, 재사용할 의미가 있을 때만 이 package에 primitive → semantic →
            component 순서로 추가한다. Intrinsic zero·percentage와 token 값을 시각화하는 demo mechanics는 예외다. Tailwind를
            쓰는 consumer도 config에서 이 CSS/TypeScript 계약을 참조해야 한다. Theme runtime, system preference, persistence와
            FOUC 처리는 별도 runtime issue의 책임이며 이 color contract에는 포함하지 않는다.
          </p>
        </aside>
      </section>
    </main>
  );
}
