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

- theme: provisional `dark` or `light`
- language: `ko` or `en`
- motion: `system` or `reduced`
- viewport: narrow 320px, mobile 390px, tablet 768px, or desktop 1440px

The Foundation Preview is the initial executable proof. Check that its current
settings follow toolbar changes, it reflows without horizontal page scrolling
at 320px, and its button can be focused and toggled with Enter or Space. The
light theme and CSS values remain provisional until the Tokens issue is done.

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

