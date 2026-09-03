# Iron & Ember visual QA and color governance

Recorded 2026-09-03 for issue [#25](https://github.com/KamiJeong/pulmu-workspace-view-demo/issues/25).

Result vocabulary is intentionally strict: `PASS` means the listed evidence ran and met its condition; `FAIL` means it ran and did not; `LIMITED` means partial evidence only; and `NOT RUN` makes no claim.

## Outcome and Before / After

**Before:** Light and Dark were implemented, but Overview visual coverage was asymmetric, visual baselines had no documented adoption policy, and arbitrary CSS colors outside the token source were review-only.

**After:** tracked product CSS has a deterministic color-literal gate; Overview has canonical Light and Dark Chromium/Linux baselines at 1440, 768, 390, and 320 pixels; Storybook accessibility violations remain errors; and baseline verification/update commands and browser limitations are explicit. Runtime component APIs and the Pulmu workflow are unchanged.

The screenshot adoption decision is **adopted for stable acceptance stories**. Baselines are reviewed source artifacts, not generated build output. Chromium on Linux is canonical because it is the browser and OS exercised by the frontend CI job. Update baselines only when the visual change is intentional and reviewed:

```bash
bun run test:visual
bun run test:visual:update
```

`test:visual:update` is authoritative only in the canonical Linux environment. CI runs the aggregate test command and fails if testing changes or creates files under a `__screenshots__` directory.

## Token contract

The dependency direction is `primitive → semantic → component`. Primitive tokens are the only layer that owns color literals. Theme selectors remap the same semantic contract; product and component CSS consume semantic or component custom properties. Exact layer ordering, references, theme symmetry, status/stage mappings, contrast, focus, chart differentiation, forced-colors values, and reduced-motion overrides are executable assertions in `packages/tokens/src/index.test.ts`.

The canonical Iron & Ember source palettes are:

| Role | Light | Dark |
| --- | --- | --- |
| canvas | `#F7F7F5` | `#111315` |
| surface | `#FFFFFF` | `#171A1D` |
| surface subtle | `#F1F1EE` | `#1D2125` |
| surface hover | `#ECEDEA` | `#24292E` |
| border | `#DADCD8` | `#2D3338` |
| border strong | `#BEC2BE` | `#3A4147` |
| text primary | `#1B1D1F` | `#F3F4F2` |
| text secondary | `#62676C` | `#A8AFB5` |
| text muted (source) | `#8D9297` | `#747C83` |
| brand | `#D85B26` | `#E66A32` |
| brand hover | `#BF491B` | `#F0783D` |
| brand soft | `#FFF0E8` | `#342018` |
| success | `#3F8F62` | `#54A875` |
| warning | `#C28A2E` | `#D5A043` |
| danger | `#C65353` | `#D66565` |
| info | `#4D78A8` | `#6590BE` |

Accessible aliases intentionally refine some source roles, including muted text, interactive boundaries, action states, status foregrounds, and chart colors. Their exact values and contrast pairings remain governed by token tests rather than duplicated as a second palette in product CSS.

The color-governance test scans tracked `.css` files under `apps/` and `packages/`, strips comments while preserving line numbers, and rejects hex, named colors, CSS-escaped color names, and color functions outside `packages/tokens/src/global.css`. Covered functions include `rgb()`/`rgba()`, `hsl()`/`hsla()`, `hwb()`, `lab()`/`lch()`, `oklab()`/`oklch()`, `color()`, `device-cmyk()`, `color-mix()`, `light-dark()`, and `contrast-color()`, including CSS-escaped function names. Semantic `var()` references and the exact CSS keywords `transparent`, `currentColor`, `Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, and `LinkText` are permitted. Future exceptions must specify an exact path, literal, and reason; the test fails unused exceptions.

## Shared Iron & Ember delivery

| Issue | Shared outcome | State in this report |
| --- | --- | --- |
| #20 | Dual-theme primitive, semantic, and component token contract | integrated |
| #21 | `system | light | dark` runtime, persistence, and Storybook controls | integrated |
| #22 | Core UI semantic visual migration | integrated |
| #23 | Forge, status, and icon semantic alignment | integrated |
| #24 | Responsive Workspace Overview acceptance slice and data states | integrated |
| #25 | Visual QA evidence, screenshot governance, and CSS literal gate | implemented here |

## Automated evidence

| Result | Date | Browser / OS | Theme | Viewport | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| PASS | 2026-09-03 | Chromium / Linux | Light | 1440×900 | `overview-light-desktop-1440-chromium-linux.png` | fonts ready, reduced motion, default focus |
| PASS | 2026-09-03 | Chromium / Linux | Dark | 1440×900 | `overview-dark-desktop-1440-chromium-linux.png` | fonts ready, reduced motion, default focus |
| PASS | 2026-09-03 | Chromium / Linux | Light | 768×1024 | `overview-light-tablet-768-chromium-linux.png` | desktop navigation contract |
| PASS | 2026-09-03 | Chromium / Linux | Dark | 768×1024 | `overview-dark-tablet-768-chromium-linux.png` | desktop navigation contract |
| PASS | 2026-09-03 | Chromium / Linux | Light | 390×844 | `overview-light-mobile-390-chromium-linux.png` | compact navigation contract |
| PASS | 2026-09-03 | Chromium / Linux | Dark | 390×844 | `overview-dark-mobile-390-chromium-linux.png` | compact navigation contract |
| PASS | 2026-09-03 | Chromium / Linux | Light | 320×720 | `overview-light-narrow-320-chromium-linux.png` | local table overflow, no page overflow |
| PASS | 2026-09-03 | Chromium / Linux | Dark | 320×720 | `overview-dark-narrow-320-chromium-linux.png` | local table overflow, no page overflow |

Every Storybook story is evaluated with the global `a11y.test = "error"` policy, including all eight Overview combinations. This is automated axe-based evidence, not a full WCAG conformance claim.

### Repository checks

| Result | Command | Coverage |
| --- | --- | --- |
| PASS | `bun run lint` | ESLint, zero warnings |
| PASS | `bun run typecheck` | workspace TypeScript |
| PASS | `bun run test` | token contracts, color governance, stories, accessibility, visual baselines |
| PASS | `bun run build` | static Storybook build |
| PASS | `bun run test:visual` | canonical story and screenshot comparison subset |

## Manual QA record

These rows are intentionally separate from automated story assertions.

| Result | Date | Browser / OS | Theme / viewport | Check | Evidence / notes |
| --- | --- | --- | --- | --- | --- |
| NOT RUN | 2026-09-03 | Chromium / Linux | Light + Dark, all viewports | keyboard order and visible focus | Play functions cover skip link, navigation, focus return, and activation; no separate human session recorded. |
| NOT RUN | 2026-09-03 | Chromium / Linux | Light + Dark | hover, active, and disabled presentation | Token/component stories exercise states; no separate pointer/manual comparison recorded. |
| NOT RUN | 2026-09-03 | Chromium / Linux | 320px | table overflow by keyboard/pointer | Automated assertions confirm local horizontal overflow and no page overflow; manual scroll session not recorded. |
| NOT RUN | 2026-09-03 | Chromium / Linux | Light + Dark | browser zoom 200% | No manual browser zoom session recorded. |
| NOT RUN | 2026-09-03 | Chromium / Linux | Light + Dark | 400% zoom / reflow | 320px automated layout evidence is useful but is not a browser zoom test. |
| NOT RUN | 2026-09-03 | Chromium / Linux | System | OS preference switching | Runtime assertions cover preference resolution; no live OS toggle recorded. |
| NOT RUN | 2026-09-03 | Chromium / Linux | Light / Dark preference | persistence across reload | Runtime tests cover storage behavior; no separate manual reload recorded. |
| NOT RUN | 2026-09-03 | Chromium / Linux | System / Light / Dark | first-paint flash | Bootstrap ordering is tested at its boundaries; video/performance trace not recorded. |
| LIMITED | 2026-09-03 | Firefox / WebKit | both themes | cross-browser behavior | Not in the automated provider matrix; no browser-specific screenshots or a11y result claimed. |
| LIMITED | 2026-09-03 | macOS / Windows | both themes | font rendering, forced colors, OS integration | Canonical screenshots are Linux-only; Windows forced-colors and macOS rendering were not run. |

## Scope remaining after Overview

Overview is the only fully composed acceptance screen in this issue. The screens tracked by #12 remain exactly:

1. Active Forge Run
2. Quench Retry
3. Hone Review Finding
4. Completed Local Delivery
5. Completed GitHub Delivery
6. Failed Run
7. Interrupted Run
8. Run History
9. Empty Workspace

Those screens are not implicitly migrated or visually approved by the Overview evidence.
