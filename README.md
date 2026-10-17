# Agent Capability Kit

> **Your AI agent has 375 skills and 39 plugins. It doesn't know that.**
>
> A three-volume system that teaches an agent what it can do — before it starts doing.

[中文版](README.zh-CN.md) · [Full Manual](MANUAL.md) · [Templates](templates/) · [Pitfalls](docs/07-pitfalls.md)

---

## The problem

You give an agent a big toolbox. It ignores it and builds everything from scratch.

Two failure modes, both expensive:

| Failure | What it looks like | Cost |
|---|---|---|
| **Reinventing** | Has a `pdf` skill, writes its own PDF code anyway | Worse quality, slower, more bugs |
| **Bingeing** | Reads all 375 SKILL.md files "to be safe" | Tens of thousands of tokens, slower, context blown |

**Root cause: the agent has no map of its own capabilities.**

You can't hand someone a library and expect them to read every book before picking one.

---

## The solution

**Two-stage lookup.**

```
INDEX  ──►  one line per capability, 375 entries still costs little context
              │
              ▼  keyword match
MANUAL ──►  full SKILL.md, only the one that matched
              │
              ▼
          execute per the manual
```

Plus a third volume that makes sure the lookup *actually happens*:

```
System prompt  ──►  "Scan the index first. Read the manual on hit. Don't guess."
```

**That's the whole idea.**

---

## Three volumes

| Volume | File | Answers | Missing means |
|---|---|---|---|
| **I · Index** | `SKILLS-INDEX.md` `PLUGINS-INDEX.md` `MCP-INDEX.md` | **What do I have?** | Rules with nothing to look up |
| **II · Template** | `SKILL-TEMPLATE.md` `PLUGIN-TEMPLATE.md` `MCP-TEMPLATE.md` | **How do I add more?** | Can extend, but agent never finds it |
| **III · Rules** | System prompt (`AGENTS.md` / `CLAUDE.md` / `.cursorrules`) | **When do I use which?** | A map nobody reads |

**All three or it doesn't work.** One or two of them just moves the problem.

---

## Why split skills / plugins / MCP?

This is where most people get it wrong. They are **not the same thing**:

| | What it is | Who provides | How to install | Produces | Reload needed |
|---|---|---|---|---|---|
| **Skill** | A **procedure** (markdown) | Community / you | Drop into `skills/` | **No tools** — read via `skill({name})` | Reload session |
| **Plugin** | A **capability built into the host** (npm package etc.) | Community / you | Package manager + register in bundle list | Tools the plugin defines | **Restart host** |
| **MCP** | **Borrowing another program's capability** | Any program, any language | Add `mcp-*` entry to config | `mcp__<serverName>__<tool>` | **Restart host** |

**In one line each:**
- Skill = *how to do it*
- Plugin = *a hand the host grew itself*
- **MCP = *bolting on someone else's hand***

**Why three separate indexes**: their **reload semantics differ**. Mix them into one list and the agent will restart the host when it only needed to reload a session.

---

## Quick start

### 1. Take inventory (don't guess)

```bash
node tools/dump-skills.cjs      # scan all SKILL.md frontmatter
node tools/dump-plugins.cjs     # read host profile package.json
grep -n "mcp-" <HOST_HOME>/profiles/<profile>/cordis.patch.yml
```

### 2. Generate the index

```bash
node tools/gen-skills-index.cjs     # auto-classify → SKILLS-INDEX.md
node tools/gen-plugins-index.cjs    # → PLUGINS-INDEX.md
```

### 3. Write the rules — **the critical step**

Copy [`examples/AGENTS.md.example`](examples/AGENTS.md.example) into your host's system prompt:

| Host | Where |
|---|---|
| **DeepSeek Harness** | `<DSH_HOME>/AGENTS.md` (user) + workspace `AGENTS.md` (project) |
| **OpenClaw** | agent persona / system prompt config |
| **Claude Code** | `CLAUDE.md` at project root |
| **Cursor** | `.cursorrules` |
| **Custom** | Your own system-prompt assembly |

**Why a file and not a chat message**: a chat instruction lasts one turn. A system-prompt file is injected in full at the start of every session.

### 4. Verify

**The hardest test**: give it a task that clearly has a matching skill.

- It says *"let me check the skill index"* → ✅ working
- It just starts building → ❌ not working, go check step 3

---

## Real numbers

This system was built and measured on a live host, not sketched on a whiteboard:

| Metric | Value |
|---|---|
| Unique skills discovered | **375** |
| Auto-classified | **375 / 375** (18 categories, 0 uncategorized) |
| Plugins catalogued | **39** (16 declared + 4 core bundles + 19 sub-plugins) |
| MCP servers | 2 (1 active, 1 configured pending restart) |
| Generated index size | ~104 KB |
| Environment | DeepSeek Harness 0.1.7-rc.2 · Windows · Node v25.2.1 |

---

## Seven pitfalls (all hit for real)

→ Full write-up: [`docs/07-pitfalls.md`](docs/07-pitfalls.md)

The three that hurt most:

### ⚠️ 1. Never classify by directory path

We grouped an `expert-library/` directory into "persona" and **217 wildly unrelated skills** landed in one bucket — because that directory actually contained Amazon ads, legal lookups, travel booking, and game dev.

**Classify by content (name + description), never by path.** Directory structure reflects *who installed it*, not *what it does*.

### ⚠️ 2. Rules must live in the system prompt

| Approach | Effect |
|---|---|
| Say it in chat | Works this turn. Gone next turn. |
| Write it in `AGENTS.md` | Injected in full every session. **Always there.** |

### ⚠️ 3. The index holds one line per item

Long indexes get slow and burn tokens — and the agent starts *reasoning inside the index* instead of reaching for the manual.

**The index is a table of contents, not the content.**

Others: empty descriptions, too-coarse category vocabulary, forgetting to restart, relative paths in MCP `command`.

---

## What's inside

```
agent-capability-kit/
├── README.md                      ← you are here
├── README.zh-CN.md                ← 中文版
├── MANUAL.md                      ← full methodology (self-contained, hand-off ready)
├── LICENSE                        ← MIT
├── docs/
│   ├── 05-how-to-replicate.md     ← step-by-step replication
│   └── 07-pitfalls.md             ← 7 real pitfalls, detailed
├── templates/
│   ├── SKILL-TEMPLATE.md          ← Volume II: skill
│   ├── PLUGIN-TEMPLATE.md         ← Volume II: plugin
│   └── MCP-TEMPLATE.md            ← Volume II: MCP
├── examples/
│   ├── AGENTS.md.example          ← Volume III: rules, copy-paste ready
│   └── SKILLS-INDEX.example.md    ← Volume I: index format
└── tools/
    ├── README.md
    ├── dump-skills.cjs            ← scan skills
    ├── gen-skills-index.cjs       ← auto-classify + generate
    ├── dump-plugins.cjs           ← scan plugins
    └── gen-plugins-index.cjs      ← generate plugin index
```

**Where to start:**

| You want to… | Read |
|---|---|
| Get the idea in 5 min | this README |
| Hand it to another agent | [`MANUAL.md`](MANUAL.md) |
| Actually build it | [`docs/05-how-to-replicate.md`](docs/05-how-to-replicate.md) |
| Copy the rules | [`examples/AGENTS.md.example`](examples/AGENTS.md.example) |
| Avoid the mistakes | [`docs/07-pitfalls.md`](docs/07-pitfalls.md) |

---

## When to use this

**Good fit:**
- Your agent has **20+ skills / plugins / MCP servers**
- You keep catching it "not using the tool it obviously has"
- You want agent behavior that is **predictable, auditable, extensible**
- You need multiple agents to **share one capability definition**

**Overkill:**
- Fewer than 5 capabilities — just list them in the system prompt
- Capabilities never change — that's a one-time config, not a system

---

## Prior art

The "index + manual" pattern is common across agent hosts: an `INDEX` listing capabilities, a `SKILL.md` per capability with the actual steps, and rules pinned in the system prompt.

This project **extends** it in four ways:

1. **One volume → three** (skill / plugin / MCP), because their install and reload semantics differ
2. **Permission declaration standard** — a plugin must state what it reads, writes, and which external services it calls
3. **Security boundaries for MCP** — it's an external program; its permissions are its own, and "silent degradation" is an anti-pattern
4. **Auto-classification tooling** — manual classification doesn't scale past ~100 capabilities

**Not solved:** model capability. This is a multi-step "read file → judge → act" loop. Small models give up halfway or start guessing. That's outside what a system can fix.

---

## License

MIT
