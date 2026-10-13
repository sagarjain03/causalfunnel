# CLAUDE.md

Read these before writing any code, in this order:

1. `docs/MEMORY.md` — where we left off. Always start here.
2. `docs/RULES.md` — hard rules. Not optional.
3. `docs/PHASES.md` — what the current phase requires.
4. `docs/ARCHITECTURE.md` / `docs/DESIGN.md` / `docs/PRD.md` — as needed.
5. `AGENTS.md` — Next.js 16 notes; read before using any Next.js API.

After finishing any task, update `docs/MEMORY.md` (completed work, current file, next step, decisions).
NEVER run git commit, git push, or any git command that changes history. The user commits manually. When a task is done, suggest a commit message in the format `feat(api): add sessions endpoint` and stop.
Do one phase at a time. Do not start the next phase until the current one's "Done when" checklist passes.
