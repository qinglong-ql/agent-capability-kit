# Agent Capability Kit · 能力三卷

![Agent Capability Kit — Index · Template · Rules](assets/banner.svg)

> Your agent has plenty of skills. It just doesn't know it has them.
> This kit teaches it to **check the index first → read the matching manual → follow it**. Only on a miss, improvise.

[中文版](README.zh-CN.md) · [Full Manual](MANUAL.md) · [Templates](templates/) · [Pitfalls](docs/07-pitfalls.md)

---

## 1. The problem

### An analogy

Your agent is a new librarian. You ask it to "look up how to handle a PDF".

- **Wing it:** ignores the library, improvises → poor result, possibly wrong.
- **Read everything:** reads all books → hours later still doesn't know which one.

**The right way:** check the catalog (3 min) → find the PDF book → **read only that one** → follow it.

**Root cause in one sentence: the agent has no map of its own capabilities.**

---

## 2. The fix: two-stage lookup

```
Step 1: check the index (one line per capability)
Step 2: on a hit, read ONLY that manual → follow the steps
```

**Why not read everything?** An index entry is one line; a manual is hundreds of words. **Indexes are cheap, manuals are expensive.** Check the index first, read the manual only on a hit.

---

## 3. The three volumes

| Volume | What it manages | Analogy |
|---|---|---|
| **I · Index** | What capabilities exist | The card catalog |
| **II · Template** | How to add new ones | A registration form |
| **III · Rules** | When to use which | The notice on the door |

**All three are required.** Index only → knows what exists but can't extend it. Templates only → can extend but the agent never discovers it. Rules only → discipline with nothing to look up. **All three → closed loop.**

---

## 4. Why split skill / plugin / MCP

They are three different things, with different reload semantics (check your host's docs; the table below is the common case):

| | Plain meaning | After changing |
|---|---|---|
| **Skill** | A procedure manual | Reload session |
| **Plugin** | A hand the agent grows itself | Restart host |
| **MCP** | Bolting on someone else's hand | Restart host |

**A single combined index makes the agent restart the host when it only needed to reload a session.**

---

## 5. Install in 5 steps

### Step 1: See what you actually have

**Never write an index from imagination — scan real files.**

- Skills: find every `SKILL.md`, read its `name` and `description` frontmatter
- Plugins: read the host's main config / manifest
- MCP: read `mcp-*` entries in the host config

> Few capabilities (< 20) → write by hand. Many (> 100) → use a script ([`tools/`](tools/) has four).

### Step 2: Write Volume I — the index

One line per capability, **described the way a user would say it, not by feature name**:

```markdown
| Capability | What it does |
|---|---|
| `pdf` | Read / create / convert / fill PDF forms |
| `excel` | Read, write, calculate, analyze spreadsheets |
```

### Step 3: Write Volume II — the template

Each manual: `name` / `description` / when to use (incl. **not applicable**) / prerequisites / steps / output spec / pitfalls.

**The single most important detail:** `description` must contain **the words the user will actually say**:

```
❌ "PDF processor" → will never match
✅ "Use when the user mentions 'PDF, convert to PDF'" → matches
```

### Step 4: Write Volume III — the rules (the step people get wrong)

Put these into your host's **system prompt file** (not once in chat):

```
1. On receiving a task, check the capability index first
2. On a hit: read the full manual, follow its steps. Never guess
3. On a miss: use general ability, and tell the user
4. Read only the hit. Never read all manuals
5. If the user names a capability, go straight to it, skip the index
6. Deliver per the manual's output spec, state the verification result
```

> Said in chat → works this turn, gone next. Written to the system-prompt file → injected every session, always there.

Where each host keeps it: DeepSeek Harness → `~/.dsh/AGENTS.md`; OpenClaw → agent persona config; Claude Code → `CLAUDE.md`; Cursor → `.cursorrules`.

### Step 5: Verify it works

**The only test that matters:** give it a task that clearly has a matching capability. Watch whether it checks first.

| Reaction | Verdict |
|---|---|
| "Let me check the index" → reads the manual → then acts | ✅ Working |
| Just starts building | ❌ Not working — go back to step 4 |

---

## 6. What it looks like when installed

```
<your host root>/
├── AGENTS.md (or CLAUDE.md / .cursorrules)  ← Volume III: rules
├── SKILLS-INDEX.md                          ← Volume I: skills
├── PLUGINS-INDEX.md                         ← Volume I: plugins
├── MCP-INDEX.md                             ← Volume I: MCP
├── SKILL-TEMPLATE.md                        ← Volume II: skills
├── PLUGIN-TEMPLATE.md                       ← Volume II: plugins
└── MCP-TEMPLATE.md                          ← Volume II: MCP
```

**7 markdown files. No dependencies, no code required.**

---

## 7. Tested at (reference only)

Built and measured on a real agent (DeepSeek Harness, Windows): several hundred skills, dozens of plugins, 2 MCP servers, 100% auto-classified. **These numbers are that machine, not a standard.**

| Your scale | Recommended approach |
|---|---|
| Fewer than 5 capabilities | Don't bother — just list them in the system prompt |
| 20–100 | Write the index by hand, copy the templates (~1 hour) |
| More than 100 | You need a script ([`tools/`](tools/)) |

---

## 8. Pitfalls

1. **Never classify by folder name** — classify by content (name + description), never by path
2. **Rules must live in a file** — said once in chat is useless
3. **One line per index entry** — the index is a table of contents, not the content
4. Empty descriptions unhandled → take the first meaningful line from the manual body
5. Too few categories → "Other" piles up → add categories, don't force-fit
6. Forgetting to restart → plugins / MCP need a host restart
7. Relative paths in MCP `command` (e.g. `npx`) → use an absolute path

---

## 9. When to use it

**Good fit:** 20+ capabilities; you keep catching the agent "not using the tool it obviously has"; you want predictable, auditable, extensible behavior.

**Overkill:** fewer than 5 capabilities; capabilities never change.

---

## 10. License

MIT — free, modifiable, redistributable, attribution not required. The only requirement: keep the copyright notice in the [`LICENSE`](LICENSE) file.
