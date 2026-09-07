# Design System v0.1 component audit

Issue #39 audits the current Soft Forge component system against every published Storybook story. The Component Map remains the representative review surface: Dark is on the left and Light is on the right at 1440px, then the same panes stack Dark before Light at 768px and below. It uses the existing semantic colors, type, spacing, borders, focus rings, and soft shadows; it does not introduce another product taxonomy.

## Canonical inventory

[`storyAuditManifest.mjs`](../apps/storybook/src/audit/storyAuditManifest.mjs) is the data-only, committed inventory. It maps all 121 story IDs from 14 story files to their exact title, displayed name, source, component-map category, applicable states, audit status, and evidence note. `bun run audit:components` compares that manifest with the built `storybook-static/index.json` and rejects missing, extra, duplicate, renamed, or incomplete records before rendering any story.

The related [`componentAudit.ts`](../apps/storybook/src/audit/componentAudit.ts) maps all 73 published `componentMaturity` APIs to precise story IDs. The Component Map exposes those links once in a compact native disclosure labelled **Published inventory**. Each theme pane is labelled **Representative samples**, which separates the complete evidence inventory from the deliberately bounded visual composition.

## Status model and result

- **Ready (73 published APIs / 121 stories):** exact inventory evidence exists and the automated matrix completed without a blocking defect.
- **Needs improvement (0):** implemented but with an unresolved visual, state, responsive, or accessibility defect.
- **Broken (0):** a blocking layout, styling, interaction, or theme defect.
- **Missing (2):** Drawer and Toast remain explicit gaps because neither has a standalone published API or complete behavior contract.
- **beta:** package API maturity. It remains separate from audit status and is not changed by this review.

## Automated evidence

After `bun run build`, `bun run audit:components` starts an isolated static server and reuses three Chromium pages. It navigates once per story with play automation disabled, then applies a controlled, transition-free audit theme and runs every story at these eight combinations:

| Theme | 1440 × 900 | 768 × 1024 | 390 × 844 | 320 × 720 |
| --- | --- | --- | --- | --- |
| Light | audited | audited | audited | audited |
| Dark | audited | audited | audited | audited |

That is 121 stories × 2 themes × 4 viewports = 968 rendered combinations and 484 paired Light/Dark parity checks. Each combination checks a nonempty stable story root, the requested `data-theme` and computed `color-scheme`, nonempty and distinct Light/Dark semantic values, WCAG 2.2 AA axe rules, page/root overflow, escaped landmark bounds, clipped landmark content, and accessible keyboard entry for intentional horizontal scrollers. After suppressing motion, the runner cancels stale Web Animations and flushes two frames instead of awaiting browser animation promises that can remain pending after their animations finish. A 30-second combination deadline fails with the story, theme, and viewport and replaces that browser page before another story runs. Each theme pair must also have identical normalized visible text, Playwright accessibility snapshots, and meaningful control state (including values and disabled, checked, selected, expanded, pressed, current, busy, and open state). This fails when a theme hides or substitutes content, changes a control role/name, or changes an interaction state.

There are currently no theme-parity allowances. A future intentional narrow presentation difference must be declared for one named viewport as an exact Light/Dark value pair with a nonempty reason; it cannot suppress other content or control drift. Storybook render errors and browser errors fail the run. The deterministic report records combination and parity totals at `test-results/component-audit/report.json`; focused OrchestrationFlow captures are written beside it as `orchestration-flow-light-320.png` and `orchestration-flow-dark-320.png`.

Canonical Storybook play functions stay separate and run through `bun run test`. Their explicit story globals, viewport assertions, overlay keyboard/focus lifecycle, and interaction assertions are not replaced by audit URL parameters. All four Component Map stories exercise Tooltip, Popover, Menu, and Dialog in both scoped theme panes after the visual baseline is captured: keyboard opening, accessible name/description, focus entry or retention, menu navigation and disabled state, dialog Tab/Shift+Tab containment that skips unavailable or hidden stops, Escape dismissal, focus restoration, and isolation from the other pane. The audit loads Storybook's `embed=true` preview mode, which disables story autoplay, before applying its controlled runtime theme so late play effects cannot create mixed-theme measurements.

## Before and after

At base commit `ef999e5`, API evidence pointed to whole story files, the 119 existing stories had no exact all-story inventory, OrchestrationFlow was still marked Needs improvement at 320px, and visually hidden table sort text could extend the document width beyond 320px. The four base Component Map screenshots at that commit are the durable before evidence for the checked-in image diffs. The status legend also omitted Broken, and evidence notes were duplicated in both theme panes through mouse-only title text.

After this audit, the 121-story manifest and exact API story links fail closed against the built index. The shared visually-hidden and table-region rules prevent narrow page overflow, equivalent chart tables have named keyboard scroll regions, and the OrchestrationFlow list removes decorative ordinals and redundant nested indentation while preserving explicit ordered-list semantics and the Pattern relationship. The Component Map has a danger-semantic Broken legend item, a keyboard/touch disclosure for evidence, visible Published inventory and Representative samples labels, and 100% Ready progress without changing public component APIs.

Checked-in visual evidence lives at:

- `apps/storybook/src/agents/__screenshots__/AgentComponents.stories.tsx/orchestration-flow-light-narrow-320-chromium-linux.png`
- `apps/storybook/src/agents/__screenshots__/AgentComponents.stories.tsx/orchestration-flow-dark-narrow-320-chromium-linux.png`
- `apps/storybook/src/screens/__screenshots__/ComponentMap.stories.tsx/component-map-{desktop,tablet,mobile,narrow}-chromium-linux.png`

## Remaining manual limits

The result is an automated Chromium/Linux acceptance audit, not a certification. Drawer and Toast remain Missing by design. Before promoting beta APIs, review Firefox and WebKit, browser zoom and text scaling, screen-reader announcements and reading order, forced-colors, localization expansion, touch behavior on physical devices, and real application data. Screenshot baselines and axe cannot replace those checks.
