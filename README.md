# Pulmu for Codex

This repository contains the Pulmu Codex skill and its specialist agent definitions.

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

## Uninstall

```bash
./uninstall.sh
```
