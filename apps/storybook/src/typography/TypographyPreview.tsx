import { PULMU_STAGES } from "@pulmu/model";

import "./TypographyPreview.css";

type TypographyPreviewProps = {
  forceFallback?: boolean;
  locale: "en" | "ko";
};

const longBranch = "pulmu/feat/typography-system-with-resilient-korean-english-identifiers";
const longCommit = "7e3b9d24c1a8f60b512d72f6928d5688d95b15aa";
const longAgent = "pulmu_accessibility_and_typography_quality_reviewer";

const copy = {
  en: {
    body: "Pulmu keeps Korean and English copy readable while the Orchestrator moves one reviewed change through the forge.",
    caption: "Supporting text remains readable without opacity.",
    intro: "A semantic scale for workflow status, metrics, identifiers, and mixed-language product copy.",
    label: "Current stage",
    mixed: "The typography contract keeps 한국어 설명 and canonical English terms together without clipping.",
    title: "Typography system",
  },
  ko: {
    body: "Pulmu는 Orchestrator가 하나의 변경을 forge 전체에서 검토하는 동안 한국어와 English copy를 읽기 쉽게 유지합니다.",
    caption: "보조 텍스트는 opacity 없이도 충분한 대비를 유지합니다.",
    intro: "Workflow 상태, metric, identifier와 한국어·영어 혼합 product copy를 위한 semantic scale입니다.",
    label: "현재 stage",
    mixed: "Typography contract는 한국어 설명과 canonical English term을 함께 표시해도 내용이 잘리지 않게 합니다.",
    title: "Typography system",
  },
} as const;

export function TypographyPreview({ forceFallback = false, locale }: TypographyPreviewProps) {
  const localized = copy[locale];

  return (
    <main
      className={`typography-preview${forceFallback ? " typography-preview--forced-fallback" : ""}`}
      data-testid="typography-preview"
      lang={locale}
    >
      <header className="typography-preview__header">
        <p className="typography-preview__eyebrow" lang="en">Pulmu Design System v0.1</p>
        <h1 lang="en">{localized.title}</h1>
        <p className="typography-preview__intro" lang={locale}>{localized.intro}</p>
      </header>

      <section aria-labelledby="type-scale-heading" className="typography-preview__section">
        <div className="typography-preview__section-heading">
          <h2 id="type-scale-heading" lang="en">Semantic type scale</h2>
          <p lang={locale}>{localized.caption}</p>
        </div>
        <dl className="typography-preview__scale">
          <div><dt lang="en">Page heading</dt><dd className="type-page" lang="en">Forge workspace</dd></div>
          <div><dt lang="en">Section heading</dt><dd className="type-section" lang="ko">검토된 delivery</dd></div>
          <div><dt lang="en">Body</dt><dd className="type-body" lang={locale}>{localized.body}</dd></div>
          <div><dt lang="en">Label</dt><dd className="type-label" lang={locale}>{localized.label}</dd></div>
          <div><dt lang="en">Caption</dt><dd className="type-caption" lang={locale}>{localized.caption}</dd></div>
        </dl>
      </section>

      <section aria-labelledby="workflow-heading" className="typography-preview__section">
        <div className="typography-preview__section-heading">
          <h2 id="workflow-heading" lang="en">Real Pulmu content</h2>
          <p lang={locale}>{localized.mixed}</p>
        </div>
        <div className="typography-preview__workflow">
          <div className="typography-preview__run-status" lang="en" role="status">
            <span aria-hidden="true" className="typography-preview__status-mark">●</span>
            <span><strong>Running</strong> · Hammer in progress</span>
          </div>
          <ol aria-label="Pulmu forge stages" className="typography-preview__stages" lang="en">
            {PULMU_STAGES.map((stage) => (
              <li key={stage.id}>
                <span aria-hidden="true">{stage.icon}</span>
                <span>{stage.name}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="metrics-heading" className="typography-preview__section">
        <div className="typography-preview__section-heading">
          <h2 id="metrics-heading" lang="en">Metrics and monospace references</h2>
          <p lang="en">Changing values align; branch, commit, agent, and code references use the shared mono role.</p>
        </div>
        <div className="typography-preview__metrics">
          <dl className="typography-preview__metric-card" lang="en">
            <div><dt>Stages complete</dt><dd data-testid="metric-value">04 / 07</dd></div>
            <div><dt>Verification</dt><dd data-testid="metric-value">128 / 128</dd></div>
          </dl>
          <dl className="typography-preview__references" lang="en">
            <div><dt>Branch</dt><dd><code data-testid="mono-reference">{longBranch}</code></dd></div>
            <div><dt>Commit</dt><dd><code data-testid="mono-reference">{longCommit}</code></dd></div>
            <div><dt>Agent</dt><dd><code data-testid="mono-reference">{longAgent}</code></dd></div>
            <div><dt>Command</dt><dd><code data-testid="mono-reference">$pulmu &quot;establish typography system&quot;</code></dd></div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="resilience-heading" className="typography-preview__section">
        <div className="typography-preview__section-heading">
          <h2 id="resilience-heading" lang="en">Overflow and fallback contract</h2>
          <p lang="en">Long identifiers wrap by default. Ellipsis is reserved for a single-line context with the full value exposed.</p>
        </div>
        <div className="typography-preview__resilience">
          <div lang="en">
            <h3>Complete wrapped value</h3>
            <code className="typography-preview__wrapped" data-testid="wrapped-identifier">{longBranch}</code>
          </div>
          <div lang="en">
            <h3>Accessible single line — focus to reveal</h3>
            <code
              aria-label={`Branch: ${longBranch}`}
              className="typography-preview__ellipsis"
              data-testid="ellipsis-identifier"
              tabIndex={0}
              title={longBranch}
            >
              {longBranch}
            </code>
          </div>
          <div className="typography-preview__fallback-sample" data-testid="fallback-sample" lang="ko">
            <h3 lang="en">Missing preferred font</h3>
            <p lang="ko">__PulmuMissingPreferred__가 없어도 한국어와 English fallback은 잘리지 않습니다.</p>
          </div>
        </div>
      </section>

      <aside aria-labelledby="font-license-heading" className="typography-preview__license" lang="en">
        <h2 id="font-license-heading">Font fallback and license record</h2>
        <p>
          Preferred family: <strong>Inter</strong>, licensed under the <strong>SIL Open Font License 1.1</strong>.
          Pulmu does not fetch or redistribute a font binary. The remaining Korean/English system fallbacks are
          platform-provided and are not redistributed by this repository.
        </p>
      </aside>
    </main>
  );
}
