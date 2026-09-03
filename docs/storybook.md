# Storybook development and review

Storybook is the executable source of truth for Pulmu Design System v0.1. Its
sidebar keeps the public review sequence stable from `01 Foundations` through
`10 Example Screens`.

## Local setup

Install Bun 1.4.0 and the pinned workspace dependencies:

```bash
bun install --frozen-lockfile
```

Start the local review server:

```bash
bun storybook
```

Open <http://localhost:6006>. Generated dependencies, test output, coverage,
and `storybook-static` are intentionally ignored by Git.

## Review controls

The preview toolbar provides shared settings for every section and story:

- theme: `system`, `light`, or `dark`, with the saved preference resolved before rendering
- language: `ko` or `en`
- motion: `system` or `reduced`
- viewport: narrow 320px, mobile 390px, tablet 768px, or desktop 1440px

The Foundation Preview consumes the shared semantic and component tokens. Check
that its current settings follow toolbar changes, it reflows without horizontal
page scrolling at 320px, and its button can be focused and toggled with Enter or
Space. The Token Catalog is the executable source for the primitive, semantic,
and component layers, including lifecycle/stage colors, focus, chart, and motion
contracts. Light and Dark share the same semantic contract and are both
acceptance themes.

## Token consumption rules

Import typed registries from `@pulmu/tokens` and global custom properties from
`@pulmu/tokens/global.css`. The token package is standalone CSS and TypeScript;
it does not require Tailwind. Product styles should consume semantic tokens,
while reusable components should expose component aliases. Do not add arbitrary
color or spacing literals, including Tailwind arbitrary values. Add a primitive,
then a semantic meaning, and finally a component alias only when a reusable
contract does not already exist.

The default dark palette verifies normal text at 4.5:1 or better, large text at
3:1 or better, and meaningful UI boundaries at 3:1 or better against their
adjacent surfaces. “Large text” means at least 24px regular or approximately
18.66px bold. Focus rings are 3px wide with a 3px offset and meet 3:1 against
canvas, default, and elevated dark surfaces. Chart colors meet 3:1 against the
dark canvas; legends must add labels, and adjacent series must also use different
stroke dashes and point shapes.

Reduced motion is available through both `prefers-reduced-motion: reduce` and
the Storybook `data-motion="reduced"` override. Forced-colors mode preserves
system text, boundary, action, and focus colors. Complete light/high-contrast
themes, full component styling, and a brand redesign remain out of scope.

## Quality gates

Run the same checks used by CI:

```bash
bun run lint
bun run typecheck
bunx playwright install chromium
bun run test
bun run build
```

`bun run test` runs stories in headless Chromium, including play functions and
accessibility checks. The global Storybook policy is `a11y.test = "error"`.
Automated checks do not replace keyboard, zoom/reflow, contrast, screen-reader,
forced-colors, and reduced-motion review.

Stable acceptance stories also use checked-in Chromium/Linux screenshots. Run
the visual subset with `bun run test:visual`. Update intentional baselines with
`bun run test:visual:update` only in the canonical Linux environment and review
the image diff before committing. The aggregate `bun run test` remains the CI
gate. See [Iron & Ember visual QA](./iron-and-ember-qa.md) for the evidence
matrix, color governance, and explicit browser/OS limitations.

The existing Pulmu runtime validation remains separate. Shell changes must also
pass:

```bash
bash -n install.sh uninstall.sh .agents/skills/pulmu/scripts/*.sh
```

## Optional local MCP

The Storybook MCP add-on is disabled during normal development, tests, static
builds, and CI. Enable it only for a local development session:

```bash
STORYBOOK_MCP=true bun storybook
```

Connect a local MCP client to <http://localhost:6006/mcp>. Do not expose this
development endpoint publicly or set `STORYBOOK_MCP` in CI. Disabling MCP does
not change normal Storybook development, tests, or static builds.
