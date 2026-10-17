# Agent Capability Kit — Full Manual

> **This file is written to be handed to any AI agent** (DeepSeek Harness, OpenClaw, Claude Code, a custom host).
>
> After reading it, the agent should be able to:
> 1. **Understand** the principle behind this system;
> 2. **Replicate** it in its own environment.
>
> Written 2026-10-17. Original environment: DeepSeek Harness 0.1.7-rc.2 on Windows, Node v25.2.1.

---

## 0. What problem does this solve

**The problem**: an agent has hundreds of skills, dozens of plugins, a few MCP servers — and **it doesn't know that**.

Two failure modes follow:

- **A. Reinventing.** A working skill/tool exists, but the agent builds from scratch. Worse quality, slower, buggier.
- **B. Bingeing.** It reads every manual "to be safe." Tens of thousands of tokens, slower, context blown, and it still wanders off.

**The fix**: **"Scan the index → read the manual only on a hit → execute per the manual."**

That is the entire idea this kit implements.

---

## 1. Core principle (three sentences)

1. **The index holds exactly one line per item** — the agent learns *what exists* at minimal context cost.
2. **The manual is read only on a hit** — saves tokens, saves time, prevents context overflow.
3. **The rules live in the system prompt** — injected every turn, not said once in chat and forgotten.

**Analogy:**
- Index = the **table of contents** on the shelf
- Manual = the **contents inside the book**
- Rules = the **notice taped to the library door** (you see it every time you walk in)

**You cannot ask a person to read an entire library before choosing one book.**

---

## 2. What the three volumes are

| Volume | Name | Where | Answers |
|---|---|---|---|
| **I** | **Index** | `SKILLS-INDEX.md` / `PLUGINS-INDEX.md` / `MCP-INDEX.md` | **What do I have?** |
| **II** | **Template** | `SKILL-TEMPLATE.md` / `PLUGIN-TEMPLATE.md` / `MCP-TEMPLATE.md` | **How do I add more?** |
| **III** | **Rules** | the rules section of the system-prompt file | **When do I use which?** |

**Why all three are required:**

- Index only → knows what exists, but can't extend it, and doesn't know when to look
- Templates only → can extend, but the agent never discovers what was added
- Rules only → discipline with nothing to look up
- **All three → closed loop**

---

## 3. Why split into skill / plugin / MCP

This is the part most people get wrong. The three are not the same thing:

| | What it is | Who provides it | How to install | Produces | Reload required |
|---|---|---|---|---|---|
| **Skill** | A **procedure** (markdown) | Community / you | Drop into `skills/` | **No tools** — read via `skill({name})` | Reload session |
| **Plugin** | A **capability the host grows itself** (npm package) | Community / you | Package manager + register in bundle list | Tools defined by the plugin | **Restart host** |
| **MCP** | **Borrowing another program's capability** | Any standalone program, any language | Add a `mcp-*` entry to config | `mcp__<serverName>__<tool>` | **Restart host** |

**In one line each:**
- Skill = *how to do it*
- Plugin = *a hand the host grew itself*
- **MCP = *bolting on someone else's hand***

**Why three separate indexes**: their **reload semantics differ**.
- Skill → reload the session
- Plugin / MCP → restart the host

Mix them into one index and the agent will restart the host when it only needed to reload a session.

---

## 4. How to replicate

### Step 0: Take inventory (do not skip this)

**Hard rule: never write an index from imagination. Scan real files.**

**Skills** — walk every `SKILL.md` and read its frontmatter:

```
~/.dsh/skills/**/SKILL.md
~/.agents/skills/**/SKILL.md
```

You need: `name`, `description`, `path`.

**Plugins** — read the host profile's `package.json`:

```
<HOST_HOME>/profiles/<profile>/package.json
  → dependencies          (top-level installs)
  → dsh.profile.bundles   (load order — this is the dependency order)
  → node_modules/<pkg>/package.json for name / version / description / dsh field
```

**MCP** — read the config:

```
<HOST_HOME>/profiles/<profile>/cordis.patch.yml
  → find `- id: mcp-*` blocks
  → extract serverName / transport / command / args / env
```

**Then verify** — configuration is not proof of loading:

| Check | How |
|---|---|
| Tool prefix present | does `mcp__<serverName>__*` appear in the tool list? |
| Process running | `Get-Process -Name <program>` |
| Timing | compare process start time vs config modified time — config later means **not loaded** |

---

### Step 1: Write Volume I (the index)

**Skill index** — if you have more than ~100 skills, generate it with a script:

1. **Auto-classify** — score each skill by keywords in `name + description`, assign to the highest-scoring category.
2. **The keyword vocabulary must be broad enough.** After the first pass, look at what fell into "Other" and **add categories** — do not force-fit.
3. **Empty descriptions** — pull the first meaningful line from the SKILL.md body (skip headings, tables, source URLs).
4. **⚠️ Never classify by directory path.** In this project, grouping the `expert-library/` directory into "persona" put **217 wildly unrelated skills** into one bucket — that directory actually contained Amazon ads, legal lookups, travel booking, and game dev. **Classification reads content, not paths.**
5. **Manual overrides** — a handful will never fit; assign them by hand.

**Plugin index** — each plugin must record:
- Chinese/plain name, one-line purpose, capabilities it exposes, load method, permission declaration.
- Mark the three role types: `declared` / `core-bundle` (label "do not touch") / `sub-of-xxx`.

**MCP index** — each entry must record:
- **Current status** (loaded / configured but pending restart)
- **How to verify it**
- **Candidate list** (worth installing but not installed) with risk level
- **Security boundary** (what it reads/writes, what external services it calls)

**Every index must open with**:
- Who it's for
- The difference between the three kinds
- The usage rules (otherwise the agent doesn't know what to do with it)

---

### Step 2: Write Volume II (templates)

One template per kind. Each must contain:

| Section | Skill | Plugin | MCP |
|---|---|---|---|
| Where it goes | ✅ | ✅ | ✅ |
| Required fields | `name` / `description` | `package.json` + `dsh` field | YAML config block |
| **Trigger / permission statement** | **user's actual words** | **5 permission questions** | **5 security questions** |
| Install steps | ✅ | ✅ | ✅ |
| Verification checklist | ✅ | ✅ | ✅ |
| Pitfalls | ✅ | ✅ | ✅ |

**The single most important thing for skills:**

> `description` must contain the **words the user will actually say**.
>
> ❌ `PDF processor`
> ✅ `Use when the user mentions "PDF, convert to PDF, read PDF, fill PDF form".`

The agent matches on this string. Write a feature name and it will never match.

**The single most important thing for plugins:** `permissions.summary` must honestly answer:

1. What does it read/write? (whole disk? a specific directory?)
2. What external services does it call? (does data leave the machine?)
3. How does it execute? (shell? fixed argv? native driver?)
4. What safety rails exist? (approval, timeout, scoping)
5. What happens on failure? (**silent degradation is an anti-pattern**)

**The single most important thing for MCP:** `command` must be an absolute path.

```yaml
# ❌ wrong
command: npx

# ✅ right
command: 'C:\Program Files\nodejs\node.exe'
args: ['C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js', '-y', '<package>']
```

---

### Step 3: Write Volume III (the rules) — the critical step

**Put [`examples/AGENTS.md.example`](../examples/AGENTS.md.example) into the host's system-prompt file.**

| Host | Where the system prompt lives |
|---|---|
| **DeepSeek Harness** | `<DSH_HOME>/AGENTS.md` (user) + workspace `AGENTS.md` (project) |
| **OpenClaw** | agent persona / system prompt config |
| **Claude Code** | `CLAUDE.md` at project root |
| **Cursor** | `.cursorrules` |
| **Custom host** | your own system-prompt assembly |

**The six iron rules** (generic, adapt as needed):

```
1. On receiving a task, check the capability index first
2. On a hit, read the full manual before acting — no guessing from memory
3. On no hit, use general ability and say so explicitly
4. Read only the hit — never read everything
5. If the user names a capability, go straight to it and skip the index
6. Deliver per the manual's "Output spec", and state the verification result
```

**⚠️ The most common mistake**: writing the rules in chat instead of in the system-prompt file.
- Chat instruction → affects this turn only, forgotten next turn
- System-prompt file → injected in full every session, **always present**

---

### Step 4: Verify

| Check | How | Pass condition |
|---|---|---|
| Index is queryable | Ask "what capabilities do you have?" | It names categories and counts, not hallucinations |
| Rules are live | Give it a task with an obvious matching skill | It says "let me check the skill index" first |
| Template works | Add a new skill using the template | It finds and uses it correctly |
| No bingeing | Watch token usage | Only the matched manual is read |
| Index matches reality | Spot-check 3 items | Name, path, description all match |

**The hardest test:**

> **Give it a task that clearly has a matching skill, and see whether it looks first.**
> - It looks → ✅ the rules are live
> - It just starts building → ❌ not live; go back to Step 3

---

## 5. Pitfalls (all hit for real)

| Pitfall | Symptom | Fix |
|---|---|---|
| **Classifying by directory path** | 217 skills in one category | Classify by content (name + description) |
| **Empty descriptions unhandled** | Index full of "(no description)" | Pull the first line from the SKILL.md body |
| **Keyword vocabulary too coarse** | Dozens in "Other" | Add categories; don't force-fit |
| **Rules written in chat** | Works one turn, forgotten next | Write into the system-prompt file |
| **Forgot to restart** | Plugin/MCP config has no effect | Skills → reload session; plugin/MCP → restart host |
| **`command` uses `npx`** | MCP can't find the command | Absolute path to node + npx-cli.js |
| **`failOnStartupError: true`** | One broken MCP kills the whole host boot | Always `false` |
| **Index too long** | Slower, burns tokens, agent reasons inside the index | One line per item; details go in the manual |
| **Index without rules** | Agent has a catalog but never consults it | All three volumes |

**A script-level trap**: `node -e` on Windows eats backslashes in path literals. Write a `.cjs` file instead.

---

## 6. Prior art

The "index + manual" pattern is common across agent hosts: an `INDEX` listing capabilities, a `SKILL.md` per capability with the actual steps, and rules pinned in the system prompt.

This project extends it in four ways:

1. **One volume → three** (skill / plugin / MCP), because their install and reload semantics differ
2. **Permission declaration standard** — a plugin must state what it reads/writes and which external services it calls
3. **Security boundaries for MCP** — it's an external program; its permissions are its own, and "silent degradation" is an anti-pattern
4. **Auto-classification tooling** — manual classification doesn't scale past ~100 capabilities

**Not solved:** model capability. This is a multi-step "read file → judge → act" loop. Small models give up halfway or start guessing. That's outside what a system can fix.

---

## 7. File list (the artifact of replication)

```
<HOST_HOME>/
├── AGENTS.md                  ← Volume III: rules (system prompt)
├── SKILLS-INDEX.md            ← Volume I: skills
├── PLUGINS-INDEX.md           ← Volume I: plugins
├── MCP-INDEX.md               ← Volume I: MCP
├── SKILL-TEMPLATE.md          ← Volume II: skills
├── PLUGIN-TEMPLATE.md         ← Volume II: plugins
├── MCP-TEMPLATE.md            ← Volume II: MCP
└── MANUAL.md                  ← this file
```

---

## Appendix A: Volume III, complete (copy-paste ready)

```markdown
# Skill usage (mandatory, always active)

## Iron rules
1. On receiving a task, first check whether an existing skill matches:
   scan the capability index; if the wording doesn't match, check the classified index.
2. On a hit: read the full manual via skill({name}), then execute per its steps.
   Never act from memory or guesswork.
3. On no hit: use general ability, and tell the user
   "no matching skill — handling this with general ability".
4. Read only the hit. Never read hundreds of manuals.
5. If the user names a skill, read that one directly and skip the index.
6. After executing, deliver per the manual's "Output spec" and state the verification result.

## Discovery flow
Task received
   ↓
Scan the index (fall back to the classified index if wording doesn't match)
   ↓
Match on trigger keywords
   ↓
Hit? ──yes──► read the full manual → execute per steps
   ↓no                                ↓
General ability                   deliver + state verification
   ↓                    ↓
   └───────── deliver + state verification

## Execution discipline
- For tool-type requests (documents, web, tables, images, search, scheduling):
  check the skill index first; do not default to hand-building.
- If the manual conflicts with common sense, follow the manual.
  If the manual is genuinely wrong, note the deviation after executing.
- Run an environment check before using a skill. On failure, report the cause — never degrade silently.
- Every deliverable must state: file name, save path, how to open it.
```

**For plugins and MCP**: same structure, replace "skill" with "plugin" / "MCP",
and change rule 1 to "check native plugins first, then MCP".

---

## Appendix B: One-line pitch (for humans)

> "This stops the AI from winging it: before it acts, it checks the catalog; on a hit it reads the
> procedure and follows it; only on a miss does it fall back to general ability.
> Index, templates and rules are kept separately, so adding a capability is just 'drop a file +
> add one line to the index'. The rules live in the system prompt, so they apply every turn instead
> of being forgotten after one."
