---
title: Claude Code Cookbook
description: Patterns for using Claude Code effectively in production
category: Guides
order: 1
---

# Claude Code Cookbook

Most teams plateau on Claude Code in their second week: CLAUDE.md balloons past 300 lines, sessions blow through context limits, and Claude quietly stops following instructions because the noise drowns the signal. The fix is almost always a context-engineering problem, not a prompting one — but the literature on how to do that well is scattered across courses, blog posts, and Discord threads.

This playbook pulls the patterns that actually move the needle into one place. It's distilled from the *Claude Code in Action* course, the [ClaudeKit beginner's guide](https://claudekit.thieunv.space/posts/claudekit-beginners-guide), HumanLayer & Builder.io best-practice posts, and ~6 months of my own production use.

**By the end of this guide, you'll be able to:**
- Write a CLAUDE.md that stays under 200 lines and survives a 2-month review
- Decide between rules, skills, commands, and hooks for any new behavior you want to inject
- Run the Brainstorm → Plan → Cook → Review loop on real features without blowing context
- Diagnose and recover from the six failure modes I (and the docs) hit most often

Read it top-to-bottom on day one, or jump to a section when you hit a wall.

---

## Table of Contents

1. [Mental model — how Claude Code actually works](#1-mental-model)
2. [Setup — first 20 minutes on a project](#2-setup)
3. [CLAUDE.md — the highest-leverage file in the harness](#3-claudemd)
4. [Rules, skills, commands — where to put what](#4-rules-skills-commands)
5. [Workflow recipes — Brainstorm → Plan → Cook → Review](#5-workflow-recipes)
6. [My personal mantras (Thần chú Claude)](#6-personal-mantras)
7. [Documentation pipeline — Confluence, API specs, SDK docs](#7-documentation-pipeline)
8. [Sub-agents & parallel work — when it's worth the cost](#8-sub-agents)
9. [Hooks, MCP, GitHub integration](#9-hooks-mcp-github)
10. [Bad practices — patterns to avoid](#10-bad-practices)
11. [Quirks, shortcuts, and tips](#11-quirks-and-tips)
12. [Recap — apply this to your repo this week](#12-recap--apply-this-to-your-repo-this-week)
13. [Resources & further reading](#13-resources)

---

## 1. Mental model

Before any commands or config, internalize three facts. Most of the rest of this cookbook is downstream of these.

**(a) Claude is stateless between sessions.** Weights are frozen. The model knows nothing about your codebase except the tokens you put into the context window each session. Everything in the cookbook below is about *getting the right tokens into the window at the right time*.

**(b) The context window is the constraint.** Performance degrades as it fills — Claude starts forgetting instructions, repeating work, ignoring CLAUDE.md. As of 2026-04, the default is 200K tokens (1M in beta for Sonnet/Opus); always check current [docs](https://code.claude.com/docs) for limits. Aim to stay under ~60% utilization. `/clear` between unrelated tasks is your most-used command.

**(c) Claude Code is agentic, not chat.** It reads files, runs bash, edits code, calls APIs through MCP — full tool access. That changes the prompting style: you describe *outcomes* and *verification criteria*, not steps. The single highest-leverage tip is **give Claude a way to verify its own work** (tests, expected outputs, linters, screenshots). When it can run `npm test` and see green, it self-corrects.

| Old habit (chat-style) | Claude Code style |
|---|---|
| You write code, AI reviews | You describe intent, AI implements |
| Copy-paste between editor and AI | AI edits files in place |
| Step-by-step instructions | Goals + verification criteria |
| One-shot answers | Multi-turn agentic loops |

---

## 2. Setup

### 2.1 Initial install

Use the native installer (no Node.js required). Run `claude` in any project directory. Authenticate once on first use. Don't bother with `npm install -g claude-code` — that path is deprecated.

### 2.2 The first `claude` session in a new repo

Don't immediately ask for code. Do this instead:

1. **`git init`** if not already a repo. Always have version control before your first session — git is your safety net.
2. **Keep permission defaults.** Let Claude ask before reads/writes/executes until you know which tools you're comfortable auto-approving.
3. **Explore first.** Ask Claude to read the codebase and summarize the architecture. This builds *its* understanding and reveals gaps in *yours*.
4. **Write CLAUDE.md by hand**, or run `/init` and then **trim aggressively**. (See §3 — auto-generated CLAUDE.md is usually bloated and is the single biggest "sub-optimal output" trap.)
5. **Use plan mode** (`Shift+Tab` to cycle modes) for anything non-trivial. Plan mode reads and proposes; it does not write. Approve the plan, then switch to default mode to execute.

### 2.3 Permissions modes (Shift+Tab cycles)

- **Plan Mode** — read-only exploration + proposed plan. Use for unfamiliar code or risky changes.
- **Default Mode** — read/write/execute, with prompts. Daily-driver mode.
- **YOLO mode** — `claude --dangerously-skip-permissions`. Use only on a feature branch you're willing to throw away. Useful for spike work or sandboxed VMs.

### 2.4 Status line

Run `/statusline` and Claude will generate a shell script for the bottom-of-terminal dashboard (model, branch, token usage, cost). Or hand-write one in `.claude/statusline.cjs`. Full schema: <https://code.claude.com/docs/en/statusline#full-json-schema>.

### 2.5 Project structure after setup

```
project/
├── CLAUDE.md                # main instructions (under ~200 lines)
├── CLAUDE.local.md          # personal, gitignored
├── .mcp.json                # MCP servers (team-shared)
├── plans/                   # generated plan docs live here
└── .claude/
    ├── settings.json        # permissions, hooks, model — committed
    ├── settings.local.json  # personal overrides — gitignored
    ├── rules/*.md           # topic/path-scoped rules
    ├── skills/<name>/       # /skill-name + supporting files
    ├── commands/*.md        # legacy slash commands (prefer skills)
    ├── agents/*.md          # subagent definitions
    └── output-styles/*.md   # response style overrides
```

Global (per-machine) equivalents live under `~/.claude/`.

---

## 3. CLAUDE.md

This file is the **highest-leverage point in the entire harness** — it goes into *every* session, so a bad line of CLAUDE.md produces bad lines in every plan, which produce bad lines in every implementation. It's worth treating like a constitution.

### 3.1 Core principles

**Less is more.** Empirical guidance from community testing suggests frontier thinking models reliably follow on the order of 150–200 instructions before adherence starts degrading; treat this as a working budget, not a hard limit. Claude Code's own system prompt already eats a meaningful chunk. Every line you add to CLAUDE.md spends from that budget — and when the budget runs out, Claude doesn't ignore the *new* rules, it ignores them *uniformly*. So adding a 50-line "tip" can degrade adherence to the rules you already had.

**Universally applicable only.** CLAUDE.md is loaded every session, regardless of task. If a rule only applies when you're touching the database schema, it doesn't belong in CLAUDE.md — it belongs in a path-scoped rule (§4) or a skill.

**Progressive disclosure.** Don't try to inline everything Claude could ever need. Instead, point to it. List the docs in `agent_docs/` with one-line descriptions, and tell Claude to read them when relevant.

**Prefer pointers to copies.** Don't paste code snippets into CLAUDE.md — they go stale. Reference files by `path:line`.

**Don't make Claude a linter.** LLMs are slow and expensive compared to Biome/ESLint/Prettier. Don't burn instruction budget on style rules a deterministic tool can enforce. Use a `Stop` hook instead — it runs the formatter and feeds errors back for Claude to fix.

**Don't `/init` and ship.** The auto-generated file is bloated and includes things Claude can already discover by reading code. `/init` is a starting draft, not a finished file.

### 3.2 Recommended structure

Open with a one-liner, then sections in this order. Mark with **bold** only the truly critical rules.

```markdown
# Project: <name>
<one-paragraph summary: what it is, who uses it, why it exists>

## Tech stack
- Frontend: ...
- Backend: ...
- DB: ...

## Commands
- `npm run dev` — start dev server
- `npm test` — run all tests
- `npm run lint` — lint check
- `npm run db:migrate` — run migrations

## Architecture (map of the codebase)
- `/app` — Next.js routes
- `/lib` — shared utilities
- `/prisma` — schema and migrations

## Code style (only what differs from language defaults)
- TypeScript strict, no `any`
- Named exports only
- Use `Result<T, E>` instead of throwing in service layer

## Important notes / gotchas
- **NEVER commit `.env` files**
- The Stripe webhook handler MUST validate signatures
- Product images live in Cloudinary, not the repo

## Detailed guidance (read when relevant)
- @docs/authentication.md
- @docs/database-schema.md
- @docs/deployment.md
```

### 3.3 The 10 rules I follow

1. Open with a one-liner explaining what the project is.
2. Make code style preferences specific and actionable.
3. Include key commands (test, build, lint, deploy).
4. Detail gotchas enough to actually prevent mistakes.
5. Keep it under 300 lines — ideally under 200. HumanLayer's root file is under 60.
6. Move detailed guidance to `@import`-ed files or `.claude/rules/`.
7. Remove anything outdated or conflicting with newer instructions.
8. Mark critical rules with emphasis — but only the truly critical ones. Bolding everything bolds nothing.
9. Add instructions as you work, not just upfront. The best rules come from PRs where Claude got it wrong.
10. Review periodically. Stale rules are worse than no rules.

### 3.4 Loading order (concatenated, not overridden)

When a session starts, Claude concatenates:

1. `~/.claude/CLAUDE.md` — global, every project
2. `<project>/CLAUDE.md` + `CLAUDE.local.md` — walks up from CWD
3. `~/.claude/rules/*.md` → `<project>/.claude/rules/*.md` — project rules win on conflict
4. `~/.claude/projects/<project>/memory/MEMORY.md` — auto-memory (first 200 lines)

Path-scoped rules (`paths:` frontmatter) only load when Claude touches a matching file — not at session start.

### 3.5 The system reminder gotcha

Claude Code injects this around your CLAUDE.md:

```
<system-reminder>
IMPORTANT: this context may or may not be relevant to your tasks.
You should not respond to this context unless it is highly relevant to your task.
</system-reminder>
```

Translation: **Claude will ignore CLAUDE.md if it decides the rules aren't relevant to the current task.** The more non-universal noise you have in there, the more the model decides "ah, it's all noise" and ignores the universal rules too. This is the structural reason "less is more" isn't just style advice.

---

## 4. Rules, skills, commands — where to put what

There are now multiple mechanisms to inject behavior. They look similar but trigger differently.

### 4.1 Decision matrix

| Mechanism | Lives in | Triggers when | Use for |
|---|---|---|---|
| `CLAUDE.md` | project root | every session | universal project context |
| `.claude/rules/*.md` (no `paths`) | project | every session, concatenated | modular topic rules (security, testing) |
| `.claude/rules/*.md` (with `paths`) | project | only when Claude touches matching files | path-scoped guidance (API conventions, DB rules) |
| `.claude/skills/<name>/SKILL.md` | project or `~` | when Claude decides the skill is relevant to the task | reusable workflows with checklists, scripts, references |
| `.claude/commands/*.md` (legacy) | project or `~` | when user types `/<command>` | quick prompts; new work should prefer skills |
| Hooks (`settings.json`) | project or `~` | deterministic events (PreToolUse, PostToolUse, Stop) | guaranteed enforcement (linting, secret-scanning) |
| Permissions (`settings.json`) | project or `~` | every tool call | allow/deny lists for tools and commands |

**The big distinction:** rules and CLAUDE.md are *guidance* — Claude reads them and may ignore them. Hooks and permissions are *enforcement* — they run regardless of what the model decides.

If a behavior must happen every time without exception → hook.
If it's contextual advice → rule or skill.

### 4.2 Path-scoped rule example

`.claude/rules/api-design.md`:

```markdown
---
description: TypeScript API conventions
paths:
  - "src/api/**/*.ts"
  - "src/services/**/*.ts"
---
# API Rules
- Use Zod schemas for every request/response body
- Service layer returns Result<T, E>; never throw
- Auth middleware runs before validation middleware
```

This file only enters the context window when Claude is reading or editing files matching those globs. Worth doing once your CLAUDE.md starts pushing past 200 lines.

### 4.3 When to write a skill vs a command

A skill is just a folder with a `SKILL.md` plus optional supporting files (scripts, reference docs, checklists). The model autonomously decides when the skill is relevant based on its description. A command is a slash you type manually.

- **Skill:** "any time the user creates a Word doc, follow this docx-creation workflow" — Claude triggers it.
- **Command:** "I want to type `/code-review` and have my custom review prompt run" — you trigger it.

Workflows that should fire automatically based on context → skill.
Workflows you explicitly invoke → command (but consider making it a skill anyway, since skills can also be invoked manually).

### 4.4 Custom slash command — the easy way

Create `.claude/commands/<name>.md` and write your prompt directly. Minimal example:

```markdown
# /scope-check

Re-read the diff. List anything that's outside the original requirement.
If you find scope creep, propose what to revert. Don't guess — ask if unclear.
```

Use `$ARGUMENTS` in the file body to take parameters from `/scope-check some/path`. For a full example tuned for code review (the one I actually use), see §6.2.

### 4.5 Output styles

`/config` → "Output style" → pick from menu, or write your own in `~/.claude/output-styles/`. The default options are Explanatory, Concise, Technical. Output styles modify the system prompt directly (saved in `settings.local.json`) — they take effect from the next session and stay stable for prompt caching.

ClaudeKit ships an alternative: `/ck:coding-level 0..5` (ELI5 → God Mode), which injects guidelines via a `SessionStart` hook into `.ck.json`. **Don't use both at once** — they overlap and produce noise.

---

## 5. Workflow recipes

The single biggest mindset shift: **never go straight from "I want feature X" to writing code.** The Anthropic-recommended loop is **Explore → Plan → Implement → Commit**. ClaudeKit formalizes it as Brainstorm → Plan → Cook → Commit.

### 5.1 The four-step loop (production grade)

#### Step 1 — Spec interview

Don't write the plan yourself. Have Claude interview you and write the plan to disk so it survives `/clear` and session crashes.

```
Start a spec for <feature>. Interview me with AskUserQuestion until you
have enough to write a complete plan. Then write to docs/plans/<feature>.md.
Stop and ask me before guessing.
```

Why a file, not just chat: the plan document is your **recovery mechanism** if the session dies. Use checkboxes for each task — they're the state log, not formality. The next session reads the plan and resumes from the first unchecked box.

#### Step 2 — Architectural review (optional but worth it)

```
Spawn the architect sub-agent to review docs/plans/<feature>.md and
identify cross-service risks before we write any code.
```

Sub-agents have fresh context — they catch what you and the main session both missed because you're too close.

#### Step 3 — Phased implementation

```
Implement phase 1 of docs/plans/<feature>.md — only the user-service changes.
Write tests first. Don't touch order-service yet.
```

Strict scope per session. Use `/clear` between phases. Commit at the end of each phase, even if the feature isn't done — partial commits are recoverable; partial unsaved sessions are not.

#### Step 4 — Quality check

```
Run /code-review on everything changed in user-service.
Spawn qa sub-agent to verify test coverage on the new modules.
```

### 5.2 Plan mode (Shift+Tab)

For any change touching more than one file: enter plan mode, describe the change, read the proposed plan, then approve or push back before any writes happen. This is the cheapest insurance there is.

Skip plan mode for typo fixes, single-line config tweaks, or anything genuinely trivial.

### 5.3 Five workflow patterns by task type

| Task | Pattern |
|---|---|
| Quick fix (< 5 min) | one prompt, no plan |
| Standard feature | brainstorm → plan → cook → commit |
| Complex (multi-day) | brainstorm → plan → `/clear` between phases |
| Bug investigation | provide symptom + logs → analyze root cause → fix manually |
| UI from Figma | brainstorm → plan → mockup HTML → review → cook |

The UI pattern is worth singling out: building a throwaway HTML mockup with mock data is faster than implementing the real component, and catches design issues before they're embedded in production code.

### 5.4 When to brainstorm vs jump to plan

Use brainstorm when:
- You don't know which approach is best
- There are real trade-offs (WebSockets vs SSE vs polling)
- It's a feature with no precedent in this codebase

Skip brainstorm and go straight to plan when:
- Approach is known (fix bug X, add endpoint per OpenAPI spec)
- You already have a design doc / Figma / PRD
- Task is constrained enough that exploration is overhead

---

## 6. Personal mantras (Thần chú Claude)

These are the prompts I append, prepend, or paste-after that actually move the needle for me.

### 6.1 The anti-guess mantra

> **Ask me if you're not clear. Don't guess or decide riskily.**

I add this to the bottom of every non-trivial prompt. The single best return on a single line of prompt text. When create-`.md`-plan-then-pass-to-other-agent workflows fail, it's almost always because the second agent guessed instead of asking.

### 6.2 The reflection prompt (`/code-review`)

The full text I use, expanded over months:

```
Before we finish, step back and review everything you just implemented.
Re-read each file you created or modified. Then answer:

1. Does the implementation actually solve the original requirement?
2. Are there any bugs, edge cases, or missing error handling?
3. Is anything over-engineered or under-engineered?
4. Would a senior engineer reviewing this PR push back on anything?
5. Refactor if possible to follow source convention, reduce complexity
   for readability, fit SOLID and the design patterns of this source.
6. Does new code affect current logic of other flows?
7. Is this implementation easy to scale and reusable if we add a new channel?

If you find issues, plan fixes — don't just list them.
If you have any concerns, ask me. Don't guess or decide riskily.
```

This catches more issues than any tooling I've ever used. The "would a senior engineer push back?" framing is doing most of the work — it forces the model to take an outside view.

### 6.3 The handoff mantra

> When create `.md` plan file and then pass to other agent to implement,
> **suggest it to ask again if not clear and lack information.**

Plans-as-files are great, but the next agent inherits zero context. Tell the plan-writer to explicitly include a "Questions to confirm before implementing" section so the receiving agent has a built-in checkpoint.

### 6.4 Verification first, always

> Write the function. **Test cases:** input X → expect Y. Run tests after.

This is the single highest-leverage habit per Anthropic's own docs. Don't say "implement email validation" — say "write `validateEmail`. Tests: `user@example.com → true`, `user@.com → false`. Run them after."

---

## 7. Documentation pipeline

A workflow I run after the implementation is reviewed and merged. Output goes to Confluence/Jira pages.

### 7.1 Implementation doc (Confluence)

Sections, in order:

- **Summary** — one paragraph, what & why
- **Goals / Non-goals** — explicit scope and explicit out-of-scope
- **System architecture** — component description + C4-model diagram
- **System data flow** — sequence diagram (split into sub-diagrams if complex)
- **API specification** — name, endpoint, method, description, request, response, body sample
- **New interface introduction** — any new contracts or types

Prompt template:

```
Based on the implemented plan at docs/plans/<feature>.md and the merged code,
draft a Confluence implementation doc with these sections: Summary, Goals,
Non-goals, System Architecture (with C4 component diagram in Mermaid),
System Data Flow (sequence diagram in Mermaid, split if needed), API
Specification (table per endpoint), New Interface Introduction.
Reference file paths and code locations. Don't invent endpoints — only
document what's actually in the code.
```

### 7.2 API documentation page

A separate, more-detailed-per-field page:

```
Generate API documentation for endpoints in <path>. For each endpoint,
produce a table with columns: Field, Type, Description, Required (Y/N),
Default, Example. One table per request body, one per response body.
Pull field-level docs from JSDoc/Pydantic/OpenAPI if present.
```

### 7.3 SDK integration doc

I model these after our team's existing `In-App Messaging SDK Integration` page (internal Confluence — link below is for my own reference and won't resolve externally):
<https://vnggames.atlassian.net/wiki/spaces/apo/pages/871563265/In-App+Messaging+SDK+Integration>

```
Generate an SDK integration page for <Feature Name> following the same
structure as the In-App Messaging integration doc. Include: Overview,
Prerequisites, Installation, Initialization, Core Methods (one section
per method with signature + parameters + return + example), Error
Handling, Lifecycle, FAQ. Use the actual SDK surface in <path>.
```

> **Note on this stage:** this is a one-shot export step. After the doc is generated, **don't keep its context for the next task** — `/clear` and start fresh. The doc generation eats a lot of tokens that aren't useful for any subsequent work.

---

## 8. Sub-agents

Sub-agents (agent teams) are advertised as a force multiplier. In practice, they're a tax on most workflows. Here's when they actually pay off — and why the default should be skepticism.

**The honest answer:** sub-agents are pointless for most things. They cost 3–4× the tokens of a single session, add coordination overhead, and the teammates inherit *only* your CLAUDE.md and your spawn prompt — none of the context the main session built up.

Use them when:
- **Parallel review** — three agents investigate security, performance, test coverage simultaneously, each uncontaminated by the others' findings.
- **Competing-theory debugging** — five agents pursue different hypotheses on a gnarly bug, push back on each other.
- **Domain-separated implementation** — frontend, backend, tests in parallel, *cleanly separated paths*.

Don't use them for: a normal feature, a single bug, a refactor.

### 8.1 Spawn prompt rules

Sub-agents start with empty context. Skimping on the spawn prompt is the most common reason results are mediocre.

- **Be explicit about project structure, relevant files, conventions, the goal.** Paste the section of CLAUDE.md they need.
- **Enforce domain separation.** Frontend agent works in `/frontend`. Backend agent works in `/backend`. Two agents on the same file = merge-conflict guaranteed.
- **5–6 tasks per teammate, max.** Don't dump 20 things on one. Self-contained units with clear deliverables.
- **Bring them back.** Don't spawn-and-forget. Have the lead synthesize.

---

## 9. Hooks, MCP, GitHub integration

### 9.1 Hooks (deterministic enforcement)

CLAUDE.md is advisory — followed maybe 80% of the time. Hooks are 100%. Anything that **must** happen every time → hook.

Common ones:

- **PostToolUse on `Edit|Write`** — run Prettier/Biome/ESLint on whatever was just edited. Errors get fed back to Claude to fix.
- **Stop hook** — run formatter + linter + typecheck before the session ends. Don't ship dirty code.
- **PreToolUse on `Bash`** — block dangerous commands (`rm -rf`, force-push to main, etc.).
- **SessionStart** — inject session-specific context (current branch, last deploy time, on-call rotation).

`settings.json` example:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "biome check --write $CLAUDE_FILE" }
        ]
      }
    ]
  }
}
```

### 9.2 MCP servers

MCP = Model Context Protocol. External tools and services Claude can call directly. Configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] }
  }
}
```

Servers I'd consider first:
- **Playwright MCP** — browser automation for visual verification
- **GitHub MCP** — issues, PRs, releases
- **Database MCP** (Postgres/Mongo) — schema introspection without giving Claude write access to prod
- **Linear/Jira MCP** — read tickets directly into context

Servers load lazily — they only consume context tokens when actually invoked.

### 9.3 GitHub PR review automation

Drop a workflow file at `.github/workflows/claude-code-review.yml`:

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    uses: anthropics/claude-code-action/.github/workflows/code-review.yml@main
    with:
      direct_prompt: |
        Please review this pull request for bugs and security issues.
        Only report on bugs and potential vulnerabilities you find.
        Be concise.
```

Tune the `direct_prompt` to your team's norms. The "be concise" line matters — without it, you get walls of low-signal commentary.

---

## 10. Bad practices

These are the failure modes I (and the docs) hit most often.

### 10.1 Kitchen-sink session

Doing five unrelated things in one session. "Fix login → add dark mode → optimize images → back to login." Context fills with cross-contamination, instructions get ignored.

**Fix:** `/clear` between unrelated tasks. Treat each task like a fresh session.

### 10.2 Correcting the same issue repeatedly

Claude gets it wrong. You correct. Still wrong. You correct again. Now your context is half failed-approach noise and Claude is more confused than before.

**Fix:** after 2 failed corrections, **`/clear` and rewrite the prompt from scratch**, more specifically. Don't keep patching.

### 10.3 "This is simple, no plan needed"

Famous last words. Three hours later you're in a debugger.

**Fix:** even a 30-second `/ck:plan --fast` saves hours on anything non-trivial.

### 10.4 Trust without verify

Claude says "Done!" — you ship — production breaks.

**Fix:** tests + manual verification + `/code-review` before "done" means done. The verification habit is the single biggest determinant of whether AI coding feels great or feels like a constant cleanup job.

### 10.5 Vague prompts

"Make it better." "Fix the bug." "Add auth."

**Fix:** symptom + location + expected behavior. "Email validation in `src/components/SignupForm.tsx` doesn't show error message when email is invalid. Expected: red text 'Invalid email' below input. Actual: just red border, no text."

### 10.6 Auto-generating CLAUDE.md and shipping it

`/init` produces a starting draft full of things Claude could discover from reading the code anyway. Anecdotally — and reported in several community write-ups — auto-generated context files can *slightly decrease* task completion rates while inflating per-session token cost. Treat the result as a draft, not a deliverable.

**Fix:** treat `/init` output as a draft. Trim aggressively. Hand-craft the parts that matter.

### 10.7 Using LLM as a linter

Burning instruction budget on style rules a deterministic tool can enforce in milliseconds.

**Fix:** Biome/Prettier/ESLint + a Stop hook that feeds errors back. Free up your CLAUDE.md instruction budget for things only an LLM can do.

---

## 11. Quirks and tips

Small things that took me embarrassingly long to figure out.

- **Paste images:** `Ctrl+V`, not `Cmd+V`. (Yes, even on Mac.)
- **Jump to a previous message:** `Esc` twice → list of all previous messages → pick one to jump back to.
- **Compaction control:** `/compact focus on the API changes and the modified file list` — guide what survives compaction. Or add a standing instruction to CLAUDE.md: "When compacting, preserve the full list of modified files and current test status."
- **`/clear` is free.** Use it more than you think you should.
- **Cost / quota visibility:** `/cost` (API users) or `/stats` (Claude Pro/Max).
- **`/status`** shows which settings layers are active (global / project / local).
- **Background loops:** `/loop 5m check if deploy succeeded` schedules a recurring prompt while your session stays open. Tasks expire after 3 days. Useful for monitoring CI without context-switching.
- **Voice input:** `/voice` enables push-to-talk; hold Space to dictate.
- **Multiple instances in parallel:** open separate terminal panes, each in a different repo or worktree. Just don't have two agents touch the same file.
- **`--add-dir`** opens additional directories in one session (monorepo, sibling design-system repo). For Claude to also load `CLAUDE.md` from those dirs, set `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`.
- **`@import` in CLAUDE.md** — `@docs/foo.md` inlines that file. Up to 5 nested hops. Use to keep CLAUDE.md short while still pulling in detail when needed.
- **Symlinks for shared rules** — `ln -s ~/shared-claude-rules .claude/rules/shared` shares one rules folder across many projects. Update once, propagate everywhere.

---

## 12. Recap — apply this to your repo this week

If you only remember four things from this playbook:

1. **Treat CLAUDE.md as a constitution.** Universal rules only, under 200 lines, point to detail rather than inlining it (§3). Less context wins; bolding everything bolds nothing.
2. **Match the mechanism to the trigger.** Hooks for must-happen, rules for path-scoped guidance, skills for workflows the model autonomously activates, commands for things you invoke manually (§4.1).
3. **Always run Plan → Cook → Review with verification gates.** Never go straight from "I want feature X" to writing code (§5). The verification habit is the single biggest determinant of whether AI coding feels great or feels like cleanup.
4. **`/clear` is free; auto-generated CLAUDE.md is not.** Clear between unrelated tasks, and treat `/init` as a draft (§10.1, §10.6).

To put this into practice **this week**:

- **Audit your current CLAUDE.md** against the §3.3 ten-rule checklist and trim ruthlessly. Aim for under 200 lines.
- **Add one Stop hook** that runs your linter (§9.1). This alone tends to cut ~30% of "fix the formatting" round-trips.
- **Try the §6.2 `/code-review` prompt** on your next PR. Compare what it surfaces to what your usual review habit catches.
- **On your next non-trivial feature**, write the plan to `docs/plans/<feature>.md` first (§5.1). Notice how much survives `/clear` because of it.

If those four moves don't measurably improve your sessions in a week, the rest of this playbook probably won't either — and I'd love to hear what's missing.

---

## 13. Resources

### Official

- **Claude Code in Action course** — <https://anthropic.skilljar.com/claude-code-in-action> (free; covers tool use, context management, custom commands, MCP, GitHub integration, hooks, SDK)
- **Claude Code docs** — <https://code.claude.com/docs/en/best-practices>
- **Status line schema** — <https://code.claude.com/docs/en/statusline#full-json-schema>
- **Hooks reference** — <https://code.claude.com/docs/en/hooks>
- **Skills reference** — <https://code.claude.com/docs/en/skills>

### Community guides I keep returning to

- **ClaudeKit beginner's guide** (Vietnamese) — <https://claudekit.thieunv.space/posts/claudekit-beginners-guide>
- **HumanLayer — Writing a good CLAUDE.md** — <https://www.humanlayer.dev/blog/writing-a-good-claude-md>
- **HumanLayer — Advanced Context Engineering for Coding Agents** — <https://www.humanlayer.dev/blog/advanced-context-engineering>
- **HumanLayer — Context-Efficient Backpressure for Coding Agents** — <https://www.humanlayer.dev/blog/context-efficient-backpressure>
- **Builder.io — CLAUDE.md guide** — <https://www.builder.io/blog/claude-md-guide>
- **Builder.io — 50 Claude Code tips** — <https://www.builder.io/blog/claude-code-tips-best-practices>
- **Roadmap.sh — Claude Code roadmap** — <https://roadmap.sh/claude-code>

### Templates and skill libraries to fork

- **Google developer skills (20 of them)** — <https://github.com/addyosmani/agent-skills/tree/main>
- **GSStack — planning templates** — <https://github.com/garrytan/gstack>
- **everything-claude-code (TDD, go-review, go-patterns)** — <https://github.com/affaan-m/everything-claude-code>
- **BMAD-METHOD — Agile AI-driven development** — <https://github.com/bmad-code-org/BMAD-METHOD>
- **12-factor-agents (context engineering)** — <https://github.com/humanlayer/12-factor-agents>
- **Quy tắc 200 dòng** — <https://thieunv.substack.com/p/ce-02-quy-tac-200-dong>

---

## Cheat sheet (the one-page version)

| Situation | Move |
|---|---|
| Starting on unfamiliar code | Plan mode → ask Claude to explain → write CLAUDE.md by hand |
| New feature | Brainstorm → write plan to `docs/plans/<feature>.md` → review → implement phase 1 |
| Standard feature | Plan → cook → `/code-review` → commit |
| Quick fix | One prompt with symptom + location + expected behavior |
| Bug investigation | Symptom + logs → analyze root cause → fix manually |
| UI from Figma | Mockup HTML first → review → real implementation |
| Multi-day work | `/clear` between phases; commit at every phase boundary |
| Refactor | Tests first → plan → implement → `/code-review` to verify zero regression |
| Onboarding a codebase | Ask Claude to explain architecture, key flows, patterns |
| Generate docs | One-shot, then `/clear` — docs context isn't useful afterwards |
| Stuck after 2 corrections | `/clear`, rewrite prompt more specifically |
| Context > 60% full | `/compact` with explicit focus, or `/clear` |
| Need guaranteed behavior | Hook, not CLAUDE.md |
| Style enforcement | Linter + Stop hook, not CLAUDE.md |

### The five rules of thumb

1. **Verify** — always give Claude a way to check its work.
2. **Plan first** — Brainstorm → Plan → Execute, written to disk.
3. **Clear often** — `/clear` between unrelated tasks.
4. **Be specific** — symptom, location, expected behavior.
5. **Trust but verify** — there's always a human review step before ship.

---

*This cookbook is a living document. Update it from your own PR reviews, from sessions where Claude got something wrong, and from new patterns the community publishes. The best entries come from the moments where you noticed yourself thinking "I should remember this for next time."*