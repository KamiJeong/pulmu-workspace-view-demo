# Design System v0.1 component audit

Issue #39 adds an executable Storybook component map for comparing the current Iron & Ember system. The map renders the same representative composition twice: Dark on the left and Light on the right at desktop width, then Dark before Light at 768px and below. It is a review surface, not a production screen or a new component taxonomy.

## Status model

Audit status and API maturity answer different questions:

- **Ready**: the published component names a canonical Storybook or documentation evidence source and has no known blocking defect in this audit.
- **Needs improvement**: the published component names evidence or an explicit inventory-only justification, but a concrete follow-up remains. `OrchestrationFlow` currently needs additional dense-content review at 320px.
- **Broken**: a blocking visual or behavioral defect. No component is allowed to remain Broken in this change.
- **Missing**: the expected capability does not have a standalone published API.
- **beta**: package API maturity from `componentMaturity`; it does not mean visually approved or standards-certified.

The typed `componentAudit` manifest in `ComponentMap.tsx` is exhaustive over `keyof typeof componentMaturity`. Ready entries require a `story:` or `docs:` evidence reference; inventory-only evidence cannot silently produce a Ready result. Story assertions reject missing, malformed, or empty references, so adding or removing a published component fails until both the inventory and its evidence are updated.

## Known gaps

| Capability | Status | Current boundary |
| --- | --- | --- |
| Drawer | Missing | There is no standalone Drawer API. Compact workspace navigation currently composes the published `Dialog`; this audit does not invent a new API. |
| Toast | Missing | There is no standalone Toast API or announcement/lifetime contract; this audit does not replace it with story-only markup. |

## Evidence captured

Automated checks cover:

- symmetric nested Dark and Light semantic/chart token scoping while preserving the root theme runtime;
- exhaustive manifest keys, typed nonempty evidence references, zero Broken entries, and visible Drawer/Toast gaps;
- one page `h1`, unique pane `h2` labels, identical ordered `h3` groups, and Dark-before-Light source order;
- distinct computed theme colors and `color-scheme` in both panes at the same time;
- identical loading, empty, and error `DataState` compositions in each theme pane;
- labelled, focusable table overflow regions, unclipped panes, and no page-level horizontal overflow;
- bounded Storybook section baselines at 1440px, 768px, 390px, and 320px for both theme headers and the lower Data, Pulmu workflow, and Overlay/gap regions. Section captures replace an invalid scaled full-page image and keep lower evidence visible;
- the repository lint, typecheck, unit/Storybook tests, accessibility gate, visual test, and Storybook build when run by Quench.

## Manual limits

The component map is an honest comparison aid, not a claim of WCAG conformance or final visual approval. Before promoting APIs from beta, manually review supported browsers and operating systems, browser zoom and text scaling, screen-reader output, keyboard-only overlay behavior, forced-colors rendering, reduced-motion behavior, localization expansion, and real application data. Screenshot baselines use Chromium and cannot substitute for cross-browser or assistive-technology testing.
