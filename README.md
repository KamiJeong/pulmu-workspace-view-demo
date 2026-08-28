# Pulmu

This repository contains the Pulmu Codex skill, its specialist agent definitions,
and the Bun workspace used to build Pulmu Design System v0.1.

## Install

```bash
git clone https://github.com/KamiJeong/pulmu-workspace-view-demo.git
cd pulmu-workspace-view-demo
./install.sh
```

Restart Codex if needed, open a Git repository, and run:

```text
$pulmu "Add a focused change and include tests"
```

The installer copies:

- `.agents/skills/pulmu` to `~/.agents/skills/pulmu`
- `.codex/agents/pulmu-*.toml` to `~/.codex/agents`

## Design system workspace

The design system is organized as private source workspaces:

- `apps/storybook` — executable documentation and review environment
- `packages/pulmu-model` — future UI-facing Pulmu model boundary
- `packages/tokens` — shared global styles and future design tokens
- `packages/icons` — future icon adapter
- `packages/ui` — future reusable UI components

Install Bun 1.4.0, then run:

```bash
bun install --frozen-lockfile
bun storybook
```

Open `http://localhost:6006` to review the numbered `01`–`10` sections.
See [docs/storybook.md](docs/storybook.md) for preview controls, quality gates,
and the optional local MCP endpoint.

## Uninstall

```bash
./uninstall.sh
```
