# Agent Capability Kit · 能力三卷

![Agent Capability Kit — Index · Template · Rules](assets/banner.svg)

> **Stop your AI agent from winging it.**
>
> Check the catalog first. On a hit, follow the manual. Only on a miss, improvise.

[中文版](README.zh-CN.md) · [Full Manual](MANUAL.md) · [Templates](templates/) · [Pitfalls](docs/07-pitfalls.md)

---

## 1. The plain-language version

### An analogy

You have a library with thousands of books.

A new employee (your AI) is told: *"Go look up how to handle a PDF."*

**What does it do?**

- **Option A — wing it:** ignores the library entirely, starts improvising. Poor result, possibly wrong.
- **Option B — read everything:** reads the entire library. Three hours later, still doesn't know which book to use.

**What should it do?**

> Check the **card catalog** (3 minutes) → find the PDF book → **read only that one** → follow it.

**That is exactly what this kit implements.**

---

### The problem your agent actually has

You gave it plenty of capabilities: skills, plugins, tools.

**It has no idea they exist.** So:

| Symptom | What you see | Cost |
|---|---|---|
| **Reinventing the wheel** | A working `pdf` skill exists, it writes its own PDF code anyway | Worse output, slower, buggier |
| **Binge-reading** | Reads every manual "to be safe" | Tens of thousands of tokens, minutes wasted, still wanders off |

**Root cause, one sentence: it has no map of its own capabilities.**

---

## 2. The fix: two-stage lookup

Two steps. That's it.

```
Step 1: check the index
            ↓ (finds a "PDF" capability that looks relevant)
Step 2: read ONLY that manual
            ↓
        follow the steps
```

**Why not just read everything?**

Because an index entry is one line; a manual is hundreds or thousands of words.

**Indexes are cheap. Manuals are expensive. So check the index first, read the manual only on a hit.**

---

## 3. The three volumes

| Volume | Manages | In one line |
|---|---|---|
| **I · Index** | **What capabilities exist** | The library's card catalog |
| **II · Template** | **How to add new ones** | A "new book" registration form |
| **III · Rules** | **When to use which** | The notice taped to the library door |

**All three are required.**

| You have | Result |
|---|---|
| Index only | Knows what exists, can't extend it, doesn't know when to look |
| Templates only | Can extend, but the agent never discovers what was added |
| Rules only | Discipline with nothing to look up |
| **All three** | **Closed loop — the agent actually checks first** |

---

## 4. Why split into skill / plugin / MCP

The most commonly confused part. **These are three different things:**

| | Plain-language meaning | Who provides it | How to install | Auto-generates tools? | **After changing** |
|---|---|---|---|---|---|
| **Skill** | A **procedure manual** | Community / you | Drop into `skills/` | No — the agent reads it on demand | Reload session |
| **Plugin** | Gives the agent **a new hand it grows itself** | Community / you | Package manager + register | Yes, tools the plugin defines | **Restart host** |
| **MCP** | **Bolts on someone else's hand** | Any standalone program | Add an entry to config | `mcp__xxx__yyy` | **Restart host** |

**Memory hook:**
- Skill = **how to do it**
- Plugin = **a hand it grew itself**
- MCP = **bolting on someone else's hand**

**Why three separate indexes?**

Their **reload semantics differ**:
- Skill → reload the session
- Plugin / MCP → **must restart the host**

**A single combined index makes the agent restart the host when it only needed to reload a session.**

---

## 5. Install it on your own agent (5 steps)

> Written generically. Works for DeepSeek Harness, OpenClaw, Claude Code, Cursor — host-specific paths are in step 6.

### Step 1: See what you actually have (no guessing)

**The most important step.** Never write an index from imagination — scan real files.

**Skills**: find every `SKILL.md`, read its `name` and `description` frontmatter.

```
<your skills dir>/**/SKILL.md
```

**Plugins**: read the host's main config/manifest.

**MCP**: read `mcp-*` entries in the host config.

> Few capabilities (< 20) → write by hand.
> Many (> 100) → use a script. This repo's [`tools/`](tools/) has four.

---

### Step 2: Write Volume I — the index

One line per capability:

```markdown
| Capability | What it does |
|---|---|
| `pdf` | Read / create / convert / fill PDF forms |
| `excel` | Read, write, calculate, analyze spreadsheets |
| `browser` | Open pages, click, screenshot |
```

**Three rules:**

1. **One line each** (roughly 10–40 words). **Steps belong in the manual.**
2. **Describe it the way a user would say it**, not by feature name.
3. **Cover the domains you actually use** — don't force-fit.

---

### Step 3: Write Volume II — the template

One manual per capability:

```markdown
---
name: pdf
description: Handles PDF tasks. Use when the user mentions "PDF, convert to PDF, read PDF, fill PDF form".
---

# PDF handling

## When to use
- Triggers: PDF, convert to PDF, read PDF, PDF form
- Not applicable: user only asks "what is a PDF" → answer directly, don't invoke this

## Prerequisites
- Python + PyMuPDF + reportlab

## Steps
1. Confirm: read or create?
2. Execute
3. **Verify** (render and look — a success exit code is not proof of correct layout)
4. Deliver (state the path and how to open it)

## Output spec
- Format: .pdf
- Location: user-specified; otherwise current directory
- Naming: descriptive, no gibberish or serial numbers

## Pitfalls
- Chinese fonts must be registered, or every page renders as boxes
```

**⚠️ The single most important detail**: the `description` line must contain **the words the user will actually say**.

```
❌ "PDF processor"                                    → will never match
✅ "Use when the user mentions 'PDF, convert to PDF'" → matches
```

---

### Step 4: Write Volume III — the rules (**the step people get wrong**)

Put this into your host's **system prompt file**:

```
[Capability usage — iron rules]
1. On receiving a task, check the capability index first.
2. On a hit: read the full manual, follow its steps. Never act from memory or guess.
3. On a miss: use general ability, and tell the user
   "no matching capability — handling this with general ability".
4. Read only the hit. Never read all manuals.
5. If the user names a capability, go straight to it and skip the index.
6. Deliver per the manual's output spec, and state the verification result.
```

**⚠️ Iron rule: it must go in a file — not be said once in chat.**

| Approach | Effect |
|---|---|
| Say it in chat ("always check skills first") | ⚠️ **Works this turn. Gone next turn.** |
| Write it in the system-prompt file | ✅ **Injected in full every session. Always there.** |

**Where your host keeps its system prompt:**

| Host | Location |
|---|---|
| **DeepSeek Harness** | `~/.dsh/AGENTS.md` (user) + workspace `AGENTS.md` |
| **OpenClaw** | agent persona / system prompt config |
| **Claude Code** | `CLAUDE.md` at project root |
| **Cursor** | `.cursorrules` at project root |
| **Your own agent** | wherever you assemble the system prompt |

---

### Step 5: Verify it actually works

**The single hardest test — and the only one that matters:**

> Give it a task that clearly has a matching capability. Watch whether it checks first.

| Its reaction | Verdict |
|---|---|
| Says "let me check the capability index" → reads the manual → then acts | ✅ **Working** |
| Just starts building | ❌ **Not working** — go back to step 4 |

**Other checks:**

| Check | How | Pass condition |
|---|---|---|
| Index is queryable | Ask "what capabilities do you have?" | Names categories and counts, no hallucination |
| Templates work | Add a new skill from the template | It finds and uses it correctly |
| No bingeing | Watch token usage | Only the matched manual is read |
| Index matches reality | Spot-check 3 entries | Name, path, description all correct |

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

**That's the whole footprint — 7 markdown files. No dependencies, no code required.**

---

## 7. Scale I tested it at (yours may differ)

**This was built and measured on a real agent:**

| Metric | My environment |
|---|---|
| Skills | Several hundred (two directories, deduplicated) |
| Auto-classification | 100% classified, zero left in "Other" |
| Plugins | Several dozen (including sub-plugins of an aggregator package) |
| MCP servers | 2 |
| Total index size | ~100 KB |
| Environment | DeepSeek Harness · Windows · Node v25 |

**⚠️ These numbers are *my* environment, not a standard.**

| Your scale | Recommended approach |
|---|---|
| Fewer than 5 capabilities | **Don't bother** — just list them in the system prompt |
| 20–100 | Write the index by hand, copy the templates. ~1 hour. |
| More than 100 | **You need a script** — [`tools/`](tools/) has four ready-made |

---

## 8. Seven pitfalls (all hit for real)

→ Full write-up: [`docs/07-pitfalls.md`](docs/07-pitfalls.md)

**The three worst:**

### ⚠️ 1. Never classify by folder name

Being lazy, I grouped an entire `expert-library/` directory into "persona" — and **200+ wildly unrelated capabilities** landed in one bucket, because that folder actually contained Amazon ads, legal lookups, travel booking, and game dev.

**Classify by content (name + description), never by folder name.**

### ⚠️ 2. Rules must live in a file, not said once

Say it in chat → works this turn, forgotten next.
Write it in the system-prompt file → injected every session, always there.

### ⚠️ 3. One line per index entry

A long index gets slow and burns tokens — and worse, the agent starts *reasoning inside the index* instead of reaching for the manual.

**The index is a table of contents, not the content.**

**Four more:** empty descriptions unhandled, too few categories, forgetting to restart, relative paths in MCP `command`.

---

## 9. Prior art

The "index + manual" pattern is common in the agent ecosystem: an `INDEX` listing capabilities, a `SKILL.md` per capability with the steps, rules pinned in the system prompt.

**This project extends it in four ways:**

1. **One volume → three** (skill / plugin / MCP) — their install and reload semantics differ
2. **Permission declaration standard** — a plugin must state what it reads, writes, and which external services it calls
3. **MCP security boundaries** — MCP is an external program; its permissions are its own, and "silent failure" is bad design
4. **Auto-classification tooling** — manual classification doesn't scale past ~100 capabilities

**Not solved:** the model has to be capable enough. This is a multi-step "read file → judge → act" loop. Small models give up halfway or start guessing. That's outside what a system can fix.

---

## 10. Repository layout

```
agent-capability-kit/
├── README.md                      ← English (this file)
├── README.zh-CN.md                ← 中文版
├── MANUAL.md                      ← full manual (English)
├── MANUAL.zh-CN.md                ← full manual (中文)
├── LICENSE                        ← MIT
├── assets/banner.svg
├── docs/
│   ├── 05-how-to-replicate.md     ← detailed replication steps
│   └── 07-pitfalls.md             ← the 7 pitfalls in depth
├── templates/
│   ├── SKILL-TEMPLATE.md          ← Volume II: skill
│   ├── PLUGIN-TEMPLATE.md         ← Volume II: plugin
│   └── MCP-TEMPLATE.md            ← Volume II: MCP
├── examples/
│   ├── AGENTS.md.example          ← Volume III: rules, copy-paste ready
│   └── SKILLS-INDEX.example.md    ← Volume I: index format
└── tools/
    ├── README.md
    ├── dump-skills.cjs
    ├── gen-skills-index.cjs
    ├── dump-plugins.cjs
    └── gen-plugins-index.cjs
```

**Where to start:**

| You want to… | Read |
|---|---|
| Understand it in 5 minutes | this README |
| Hand it to another AI to replicate | [`MANUAL.md`](MANUAL.md) |
| Actually build it | [`docs/05-how-to-replicate.md`](docs/05-how-to-replicate.md) |
| Copy the rules verbatim | [`examples/AGENTS.md.example`](examples/AGENTS.md.example) |
| Avoid the mistakes | [`docs/07-pitfalls.md`](docs/07-pitfalls.md) |

---

## 11. When to use it

**Good fit:**
- Your agent has **20+ skills / plugins / MCP servers**
- You keep catching it "not using the tool it obviously has"
- You want predictable, auditable, extensible agent behavior
- Multiple agents need to **share one capability definition**

**Overkill:**
- Fewer than 5 capabilities — just list them in the system prompt
- Capabilities never change — that's a one-time config, not a system

---

## 12. License

**MIT License**

Plain English:

| You may | |
|---|---|
| ✅ Use it free | Commercial, personal, internal — all fine |
| ✅ Modify it | However you like, no need to tell me |
| ✅ Redistribute it | Bundle it into your own project, even sell it |
| ✅ Skip attribution | No need to credit the author in your UI |

**The one requirement**: keep the copyright notice in the [`LICENSE`](LICENSE) file.

**No warranty**: if something breaks, the author is not liable.

**Why MIT**: it's the most permissive and widely used open-source license. React, Node.js, Vue and jQuery all use it.

Full terms: [`LICENSE`](LICENSE).

---

**If this helped, a ⭐ star is appreciated.**
