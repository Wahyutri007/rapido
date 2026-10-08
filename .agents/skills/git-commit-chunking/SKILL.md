---
name: git-commit-chunking
description: >-
  Use when the user wants help committing uncommitted changes and splitting a
  large pile of mixed edits into a series of logical commits ("chunk out" the
  commits). Covers inspecting the working tree, grouping changes by intent,
  matching the repo's commit message style, and confirming the plan before
  committing. Also use for reviewing what is currently uncommitted.
---

# Git Commit Chunking

Turn a working tree full of mixed changes into a small series of meaningful
commits instead of one giant blob. **Never commit, push, or amend until the user
explicitly asks.**

## 1. Inspect

Run these together:

```bash
git status --porcelain -uall   # -uall lists files inside untracked new dirs
git diff --stat                # summary of modified files
git log --oneline -15          # learn the repo's commit message style
git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'  # upstream
```

Then read the actual changes — do **not** group by filename alone:

- `git diff -- <paths...>` for modified files (batch related paths in one call).
- Read untracked files (`??`) in full.

Gotchas:

- On Windows PowerShell, quote paths containing parentheses:
  `git diff -- 'app/(back-office)/home/index.tsx'`. Unquoted parens break the shell.
- `git status` shows new dirs collapsed (`?? app/.../report/`); `-uall` expands them.

## 2. Group into commits

Group by **intent / feature**, not directory. Aim for a handful of commits, not
one per file and not one giant commit.

- Dependency / primitive layers first (icons, shared components, hooks, design
  tokens) — later commits consume them, so committing them first keeps each
  commit buildable.
- The feature that consumes them next.
- Refactors, fixes, docs, and formatting kept separate.

Prefer build-safe ordering where practical. Call out **blast radius** when a
commit touches widely-shared files (`components/ui/*`, `components/custom/*`,
`components/common/*`, `global.css`).

Never stage secrets, `.env*`, credentials, or generated output (`dist/`,
`node_modules/`). Flag anything suspicious before committing.

## 3. Commit message style

Match the repo — read `git log` first. In this repo that means:

- Conventional prefixes: `feat:`, `refactor:`, `fix:`, `docs:`, `style:`,
  `types:`, `chore:`.
- **Title-only by default** — most commits here are a single descriptive line,
  even large ones. Add a short 2–3 bullet body only when the "why" isn't obvious
  from the title (ask the user which they want for the big ones).

## 4. Confirm, then commit

1. Present the plan as a numbered list: **message + the exact files** in each
   commit, plus any notes (blast radius, whitespace-only changes, ordering).
2. Wait for confirmation and honor any trimming/merging the user requests.
3. Commit one group at a time — stage the exact paths, then commit.
4. Verify each commit with `git show --stat --oneline HEAD` and confirm only the
   intended files landed.
5. Only push when explicitly asked. Pushing pushes **every** local commit ahead
   of upstream, not just the new ones — say so. If auth fails (e.g. SSH key),
   hand pushing back to the user; do not reconfigure remotes or credentials.

## Example plan shape

```
1. feat: add <x> icons and refresh <y> illustrations
   - components/icons/*, assets/images/icons/<group>/*
2. feat: add reusable <wrapper> and <fab>
   - hooks/use*.ts, components/common/*.tsx
3. feat: add <screen> and revamp <menu>
   - app/**, components/custom/*, components/feature/**
4. feat: add button loading state and refresh shared ui surfaces
   - components/ui/button/*, global.css, components/common/Wrapper.tsx
5. feat: revalidate persisted auth session on app bootstrap
   - context/AuthContext.tsx, hooks/useNavigateAuthenticated.ts, app/index.tsx
6. docs: add figma slicing conventions to agents guide
   - AGENTS.md
```
