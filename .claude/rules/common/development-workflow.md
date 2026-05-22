# Development Workflow

## Feature Implementation

0. **Research** — GitHub search first → library docs second → package registries. Prefer battle-tested over hand-rolled.
1. **Plan** — Use planner agent. PRD + architecture + task list.
2. **TDD** — Write tests first (RED) → implement (GREEN) → refactor (IMPROVE) → 80%+ coverage.
3. **Code Review** — Use code-reviewer immediately after writing. Address CRITICAL/HIGH.
4. **Commit** — See commit format below.

## Commit Message Format
```
<type>: <description>
<optional body>
```
Types: feat, fix, refactor, docs, test, chore, perf, ci

## PR Workflow
1. Analyze full commit history (not just latest)
2. `git diff [base-branch]...HEAD`
3. Draft comprehensive PR summary with test plan
4. Push with `-u` if new branch
