import type { CSSProperties } from "react";

import {
  BRAND_ICONS,
  ICON_SIZES,
  ICON_STROKE_WIDTH,
  LoadingIcon,
  PULMU_PATTERN_ICON,
  PULMU_RUN_STATUS_ICONS,
  PULMU_STAGE_ICONS,
  PULMU_STAGE_STATUS_ICONS,
  PulmuIcon,
  UI_ICONS,
} from "@pulmu/icons";
import "@pulmu/icons/global.css";

import "./IconCatalog.css";

const readableName = (name: string) =>
  name
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());

type IconGridProps = {
  readonly label: string;
  readonly registry: Record<string, (typeof UI_ICONS)[keyof typeof UI_ICONS]>;
  readonly tone?: (name: string) => CSSProperties;
};

function IconGrid({ label, registry, tone }: IconGridProps) {
  return (
    <ul aria-label={label} className="icon-grid" lang="en">
      {Object.entries(registry).map(([name, icon]) => (
        <li className="icon-card" key={name} style={tone?.(name)}>
          <PulmuIcon decorative icon={icon} />
          <strong>{readableName(name)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function IconCatalog() {
  return (
    <main className="icon-catalog">
      <header className="icon-catalog__intro">
        <p className="icon-catalog__eyebrow" lang="en">Pulmu design system · 04</p>
        <h1 lang="en">Icon catalog</h1>
        <p>
          <a href="https://lucide.dev/" rel="noreferrer" target="_blank">Lucide React 1.34.0</a>의
          일관된 outline glyph를 사용한다. 아이콘은 현재 색을 상속하며 16px 또는 20px 크기와 2px stroke를 유지한다.
        </p>
        <aside className="icon-catalog__rules" aria-labelledby="icon-rules-heading">
          <h2 id="icon-rules-heading" lang="en">Usage rules</h2>
          <ul>
            <li>일반 UI, lifecycle status, Pulmu stage, brand namespace를 섞지 않는다.</li>
            <li>아이콘만 있는 control의 accessible name은 parent control에 둔다.</li>
            <li>장식 SVG는 assistive technology와 keyboard focus에서 제외한다.</li>
            <li>Status는 항상 보이는 text label과 함께 표시한다.</li>
          </ul>
        </aside>
      </header>

      <section aria-labelledby="general-icons-heading">
        <h2 id="general-icons-heading" lang="en">General UI</h2>
        <p>제품 action과 navigation에 쓰는 제한된 glyph 집합이다.</p>
        <IconGrid label="General UI icons" registry={UI_ICONS} />
      </section>

      <section aria-labelledby="status-icons-heading">
        <h2 id="status-icons-heading" lang="en">Lifecycle status</h2>
        <p>색과 glyph는 보이는 상태 이름을 보조하며, 그 자체가 유일한 상태 표현이 아니다.</p>
        <h3 lang="en">Run status</h3>
        <IconGrid
          label="Run status icons"
          registry={PULMU_RUN_STATUS_ICONS}
          tone={(status) => ({ color: `var(--pulmu-color-status-${status})` })}
        />
        <h3 lang="en">Stage status</h3>
        <IconGrid
          label="Stage status icons"
          registry={PULMU_STAGE_STATUS_ICONS}
          tone={(status) => ({ color: `var(--pulmu-color-stage-status-${status.replaceAll("_", "-")})` })}
        />
      </section>

      <section aria-labelledby="stage-icons-heading">
        <h2 id="stage-icons-heading" lang="en">Seven canonical forge stages</h2>
        <p>고정된 emoji, 이름, step 문구를 보존하고 Lucide glyph는 보조 시각 요소로만 사용한다.</p>
        <ol aria-label="Canonical Pulmu stage icons" className="stage-icon-grid" lang="en">
          {PULMU_STAGE_ICONS.map((stage) => (
            <li
              className="stage-icon-card"
              data-stage-icon="true"
              data-stage-id={stage.id}
              key={stage.id}
              style={{ color: `var(--pulmu-color-stage-${stage.id})` }}
            >
              <div className="stage-icon-card__heading">
                <PulmuIcon decorative icon={stage.glyph} />
                <strong>{stage.icon} {stage.name}</strong>
              </div>
              <p>{stage.step}</p>
              {stage.id === PULMU_PATTERN_ICON.parentStageId ? (
                <div className="pattern-icon-card" data-testid="pattern-icon">
                  <PulmuIcon decorative icon={PULMU_PATTERN_ICON.glyph} size="sm" />
                  <div>
                    <strong>{PULMU_PATTERN_ICON.icon} {PULMU_PATTERN_ICON.name}</strong>
                    <span>Conditional design pass nested inside Shape</span>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="brand-icons-heading">
        <h2 id="brand-icons-heading" lang="en">Brand</h2>
        <p>Brand glyph는 일반 UI icon과 별도 registry에서 관리한다.</p>
        <IconGrid label="Brand icons" registry={BRAND_ICONS} />
      </section>

      <section aria-labelledby="icon-rules-demo-heading">
        <h2 id="icon-rules-demo-heading" lang="en">Size, stroke, and accessibility</h2>
        <div className="icon-catalog__demo-grid">
          <article className="icon-demo-card">
            <h3 lang="en">Size and stroke</h3>
            <div className="icon-size-row">
              {Object.entries(ICON_SIZES).map(([size]) => (
                <span key={size}>
                  <PulmuIcon decorative icon={UI_ICONS.search} size={size as keyof typeof ICON_SIZES} />
                  <code>{size} · {size === "sm" ? "16px" : "20px"}</code>
                </span>
              ))}
            </div>
            <p><code>strokeWidth={ICON_STROKE_WIDTH}</code></p>
          </article>

          <article className="icon-demo-card">
            <h3 lang="en">Accessible control</h3>
            <button aria-label="Open icon settings" className="icon-only-button" type="button">
              <PulmuIcon decorative icon={UI_ICONS.settings} />
            </button>
            <p>Control이 이름을 제공하고 내부 SVG는 decorative다.</p>
          </article>

          <article className="icon-demo-card">
            <h3 lang="en">Meaningful image</h3>
            <PulmuIcon decorative={false} icon={UI_ICONS.info} label="Icon guidance" />
            <p>독립적으로 의미를 전달하는 SVG는 <code>role=&quot;img&quot;</code>와 label을 함께 받는다.</p>
          </article>

          <article className="icon-demo-card">
            <h3 lang="en">Loading</h3>
            <LoadingIcon data-testid="loading-icon" label="Loading workspace" />
            <p>Reduced motion에서는 회전만 멈추고 glyph와 보이는 loading text는 유지된다.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
