# MIHENK Personal OS - Taskade Export

This branch contains the local Taskade `.tsk` export imported by Codex from:

`/Users/heingart/Downloads/mhenk-personal-os.tsk`

Import date: 2026-06-30
Source package size: 1.3 MB

## Layout

- `apps/default/` - exported Taskade Genesis app source, docs, module files, and ZO export notes
- `agents/` - exported Taskade agents
- `automations/` - exported Taskade automations
- `projects/` - exported Taskade project JSON data
- `manifest.json` - Taskade export manifest

## Acceptance Note

This branch is a raw export/import branch. It is not production-accepted by itself.
For MIHENK acceptance, Codex still requires these gates:

- full source or unified diff
- build result
- smoke result
- Taskade readback/project IDs
- known limits
- Zo runtime integration check
