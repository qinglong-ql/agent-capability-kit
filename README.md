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

## 5. How to install (two routes, pick one)

> **Definition of done:** ask your agent "What capabilities do you have?" — it should answer with categories and counts, not make things up.

### Route A: Copy the text to your agent (easiest, recommended)

> Copy the **whole block below** and send it to your agent (paste into chat, or write it into a file it always reads). It will create the three volumes in your environment by itself.

```
[TASK: Create the "Capability Trilogy"]
You are this machine's AI agent. Create a "Capability Trilogy" in my environment, so that any AI that reads it knows what capabilities it has and when to use which.

1. Create 3 kinds of files:
1. Index volumes (tell the agent what exists): SKILLS-INDEX.md, PLUGINS-INDEX.md, MCP-INDEX.md
2. Template volumes (tell the agent how to add new capabilities): SKILL-TEMPLATE.md, PLUGIN-TEMPLATE.md, MCP-TEMPLATE.md
3. Rules volume (tell the agent when to use which): write into my system prompt file (DeepSeek Harness → ~/.dsh/AGENTS.md; OpenClaw → agent persona config; Claude Code → CLAUDE.md; Cursor → .cursorrules)

2. How to write the index volumes:
- One line per capability: | Capability | What it does |
- Describe it the way the user would say it, not by feature name
- e.g. | pdf | read/create/convert/fill forms |  | excel | spreadsheet read/write/analyze |
- Before writing, scan real files (find all SKILL.md frontmatter name+description). Never invent from imagination
- Few capabilities (<20) → write by hand; many (>100) → generate with a script

3. How to write the template volumes:
- One template per capability type, containing: name / description / when to use (incl. not applicable) / prerequisites / steps / output spec / pitfalls
- Most important: description must contain the words the user will actually say; a feature name will never match
- e.g. Don't write "PDF processor"; write "Use when the user mentions 'PDF, convert to PDF, read PDF, fill forms'"

4. What the rules volume must contain (must go into the system prompt FILE, not just said in chat):
[Iron rules]
1. On receiving a task → check the capability index first
2. On a hit → read the full manual before acting; never act from memory
3. On a miss → use general ability and tell the user "no matching capability, handling with general ability"
4. Read only the hit. Never read all manuals
5. If the user names a capability → read it directly, skip the index
6. Deliver per the manual's output spec, and state the verification result
[Discovery flow]
Receive task → scan skills dirs (if Chinese doesn't match → check categorized index) → match by trigger keywords → hit? → read full manual → follow steps; no hit → answer with general ability
[Discipline]
- For tool-type requests (docs/web/sheets/images/search/scheduling etc.) → check skills first by default; don't improvise
- When a manual conflicts with common sense, follow the manual; if the manual is wrong, note the deviation after executing
- Check environment before using a skill; report the cause on failure; never degrade silently
- Deliverables must state: file name, save path, how to open

5. Definition of done:
- Ask me "What capabilities do you have?" → I answer with categories and counts, not made up
- Give me a task with an obvious matching skill → I check the index first, then act
- All three kinds of files exist, rules written into the system prompt file
```

### Route B: Command-line install (do it yourself, DeepSeek Harness example)

#### Prerequisite: Node.js v18+

Windows check: `node -v` (if missing, install the LTS from nodejs.org).

#### Step 1: Get this repo

```bash
git clone https://github.com/qinglong-ql/agent-capability-kit.git
cd agent-capability-kit
# or click Code → Download ZIP, unzip and cd in
```

#### Step 2: Copy templates into your skills dir

```bash
mkdir -p ~/.dsh/skills/_templates
cp templates/*.md ~/.dsh/skills/_templates/
```

#### Step 3: Put the rules into your system prompt file (most important)

```bash
# backup first
cp ~/.dsh/AGENTS.md ~/.dsh/AGENTS.md.bak.$(date +%Y%m%d%H%M%S)

# append the rules example (creates AGENTS.md if missing)
type examples\AGENTS.md.example >> ~/.dsh\AGENTS.md
# macOS/Linux: cat examples/AGENTS.md.example >> ~/.dsh/AGENTS.md
```

> ⚠️ Get this wrong and nothing else matters. Rules must live in a file, not be said once in chat.

#### Step 4: Scan real skills, generate the index

```bash
# First edit the dirs array at the top of tools/dump-skills.cjs to your skills dirs
# e.g. const dirs = [path.join(HOME, '.dsh', 'skills'), path.join(HOME, '.agents', 'skills')];

node tools/dump-skills.cjs        # scan → %TEMP%/skills-inventory.json
node tools/gen-skills-index.cjs   # generate → ~/.dsh/SKILLS-INDEX.zh.md

# Plugins index (first edit profileDir in dump-plugins.cjs)
node tools/dump-plugins.cjs
node tools/gen-plugins-index.cjs  # generate → ~/.dsh/PLUGINS-INDEX.zh.md
```

#### Step 5: Restart and verify

- Skills: **reload the session**
- Plugins / MCP: **restart the host**
- Then ask it: **"What capabilities do you have?"** — categories and counts = done

### Other hosts: step 3's file location

| Host | Where the rules go |
|---|---|
| **DeepSeek Harness** | `~/.dsh/AGENTS.md` (user level) |
| **OpenClaw** | agent persona / system prompt config |
| **Claude Code** | `CLAUDE.md` at project root |
| **Cursor** | `.cursorrules` at project root |

---

## 6. Build it yourself (optional, from scratch)

> Only if you want to start from zero instead of using the ready-made templates.

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

### Step 5: Verify it works

**The only test that matters:** give it a task that clearly has a matching capability. Watch whether it checks first.

| Reaction | Verdict |
|---|---|
| "Let me check the index" → reads the manual → then acts | ✅ Working |
| Just starts building | ❌ Not working — go back to step 4 |

---

## 7. What it looks like when installed

```
<your host root>/
├── AGENTS.md (or CLAUDE.md / .cursorrules)  ← Volume III: rules
├── SKILLS-INDEX.zh.md                       ← Volume I: skills
├── PLUGINS-INDEX.zh.md                      ← Volume I: plugins
├── MCP-INDEX.zh.md                          ← Volume I: MCP
├── SKILL-TEMPLATE.md                        ← Volume II: skills
├── PLUGIN-TEMPLATE.md                       ← Volume II: plugins
└── MCP-TEMPLATE.md                          ← Volume II: MCP
```

**7 files (incl. AGENTS.md) is the whole footprint. No dependencies, no code required.**

---

## 8. Tested at (reference only)

Built and measured on a real agent (DeepSeek Harness, Windows): several hundred skills, dozens of plugins, 2 MCP servers, 100% auto-classified. **These numbers are that machine, not a standard.**

| Your scale | Recommended approach |
|---|---|
| Fewer than 5 capabilities | Don't bother — just list them in the system prompt |
| 20–100 | Write the index by hand, copy the templates (~1 hour) |
| More than 100 | You need a script ([`tools/`](tools/)) |

---

## 9. Pitfalls

1. **Never classify by folder name** — classify by content (name + description), never by path
2. **Rules must live in a file** — said once in chat is useless
3. **One line per index entry** — the index is a table of contents, not the content
4. Empty descriptions unhandled → take the first meaningful line from the manual body
5. Too few categories → "Other" piles up → add categories, don't force-fit
6. Forgetting to restart → plugins / MCP need a host restart
7. Relative paths in MCP `command` (e.g. `npx`) → use an absolute path

---

## 10. When to use it

**Good fit:** 20+ capabilities; you keep catching the agent "not using the tool it obviously has"; you want predictable, auditable, extensible behavior.

**Overkill:** fewer than 5 capabilities; capabilities never change.

---

## 11. License

MIT — free, modifiable, redistributable, attribution not required. The only requirement: keep the copyright notice in the [`LICENSE`](LICENSE) file.
