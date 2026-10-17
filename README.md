# 能力三卷 · Capability Trilogy

> **让 AI agent 不再瞎干：动手前先查目录，命中就读说明书按步骤做，没命中才用通用能力。**

一套给 AI agent 的「能力管理」方法 —— 索引卷管**有什么**，模板卷管**怎么加**，规矩卷管**什么时候用**。

适用于任何有技能 / 插件 / MCP 体系的 agent 宿主：[DeepSeek Harness](#)、OpenClaw、Claude Code、Cursor、自研 agent。

---

## 这套东西解决什么问题

AI agent 有几百个技能、几十个插件、几个 MCP，但**它不知道自己有什么**。于是：

| 坏情况 | 表现 | 代价 |
|---|---|---|
| **A. 硬做** | 明明有现成技能/工具，却从零手搓 | 质量差、慢、容易错 |
| **B. 乱翻** | 把几百份说明书全读一遍 | 烧几万 token、拖慢、跑偏 |

**解法：两段式查找。**

```
索引（一句话简介，几百条也只占很少上下文）
   ↓ 匹配命中
说明书（完整步骤，只读命中那一份）
   ↓
按步骤执行
```

类比：**你不可能让人把整个图书馆的书都读一遍，再决定借哪本。**

---

## 三卷是什么

| 卷 | 文件 | 回答什么 | 缺了会怎样 |
|---|---|---|---|
| **卷一 · 索引** | `SKILLS-INDEX.md` / `PLUGINS-INDEX.md` / `MCP-INDEX.md` | **有什么能力？** | 有规矩但没东西可查 |
| **卷二 · 模板** | `SKILL-TEMPLATE.md` / `PLUGIN-TEMPLATE.md` / `MCP-TEMPLATE.md` | **怎么加新能力？** | 会加，但加完 agent 发现不了 |
| **卷三 · 规矩** | `AGENTS.md`（写进 system prompt） | **什么时候该用哪个？** | 有目录但不知道什么时候查 |

**三卷必须齐。** 只做一两卷转不起来。

---

## 为什么要分成「技能 / 插件 / MCP」三类

这是最容易搞混的地方。三者**不是一回事**：

| | 是什么 | 谁提供 | 怎么装 | 产生什么 | 改完怎么生效 |
|---|---|---|---|---|---|
| **技能** | 干某类活的**流程说明书**（markdown） | 社区 / 自己写 | 放进 `skills/` 目录 | **不产生工具**，靠 `skill({name})` 读 | 重载会话 |
| **插件** | 给宿主**自己长出来的能力**（npm 包等） | 社区 / 自己写 | 包管理器安装 + 加进装载列表 | 插件自定义的工具 | **重启宿主** |
| **MCP** | **把外部程序的能力接进来** | 任何语言的独立程序 | 配置文件加 `mcp-*` 条目 | `mcp__<serverName>__<tool>` | **重启宿主** |

**一句话记：**
- 技能 = 「怎么干」
- 插件 = 「自己长出来的手」
- **MCP = 「把别人的手接上」**

**为什么必须分开建索引**：三者的**生效时机不同**。混在一份索引里，agent 会搞错「改完要不要重启」。

---

## 快速开始（5 分钟）

### 1. 摸家底（别凭想象写索引）

```bash
# 技能：扫所有 SKILL.md 的 frontmatter
find <SKILLS_DIR> -name SKILL.md

# 插件：读 profile 的 package.json
cat <HOST_HOME>/profiles/<profile>/package.json

# MCP：读配置
grep -n "mcp-" <HOST_HOME>/profiles/<profile>/cordis.patch.yml
```

### 2. 生成索引

```bash
node tools/dump-skills.cjs        # 扫出技能清单 → %TEMP%/skills-inventory.json
node tools/gen-skills-index.cjs   # 自动分类 → ~/.dsh/SKILLS-INDEX.zh.md
```

### 3. 写规矩（最关键）

把 [`templates/AGENTS.md.example`](examples/AGENTS.md.example) 的内容追加到宿主的 system prompt 文件：

| 宿主 | system prompt 位置 |
|---|---|
| **DeepSeek Harness** | `<DSH_HOME>/AGENTS.md`（用户级）+ 工作区 `AGENTS.md`（项目级） |
| **OpenClaw** | agent 的 persona / system prompt 配置 |
| **Claude Code** | 项目根 `CLAUDE.md` |
| **Cursor** | `.cursorrules` |

### 4. 验证

**最硬的验证：给它一个有对应技能的任务，看它会不会先查。**

- 会先查 → ✅ 规矩生效了
- 直接上手 → ❌ 没生效，回去检查规矩是不是写进了 system prompt

---

## 目录结构

```
capability-trilogy/
├── README.md                          ← 本文件
├── 能力三卷-总纲.md                    ← 完整方法论文档（12.9 KB，自包含，可交给其他 agent）
├── LICENSE                            ← MIT
├── docs/
│   ├── 05-how-to-replicate.md         ← 复刻步骤（含时间估算）
│   └── 07-pitfalls.md                 ← 7 个实测踩过的坑
├── templates/
│   ├── SKILL-TEMPLATE.md              ← 卷二：技能说明书模板
│   ├── PLUGIN-TEMPLATE.md             ← 卷二：插件说明书模板
│   └── MCP-TEMPLATE.md                ← 卷二：MCP 接入模板
├── examples/
│   ├── AGENTS.md.example              ← 卷三：规矩卷，可直接照抄
│   └── SKILLS-INDEX.example.md        ← 卷一：索引写法示例
└── tools/
    ├── README.md                      ← 四个脚本怎么用
    ├── dump-skills.cjs                ← 扫描技能清单
    ├── gen-skills-index.cjs           ← 自动分类生成技能索引
    ├── dump-plugins.cjs               ← 扫描插件清单
    └── gen-plugins-index.cjs          ← 生成插件索引
```

**从哪开始读**：

| 你想… | 读这个 |
|---|---|
| 5 分钟了解全貌 | 本 README |
| 完整方法论 / 交给另一个 agent | [`能力三卷-总纲.md`](能力三卷-总纲.md) |
| 动手复刻 | [`docs/05-how-to-replicate.md`](docs/05-how-to-replicate.md) |
| 直接抄规矩 | [`examples/AGENTS.md.example`](examples/AGENTS.md.example) |
| 少踩坑 | [`docs/07-pitfalls.md`](docs/07-pitfalls.md) |

---

## 实测数据（本方法诞生环境）

| 项 | 数量 |
|---|---|
| 扫描到的唯一技能 | **375 个**（两个目录去重后） |
| 自动归类成功 | **375 / 375**（18 个分类） |
| 插件 | **39 个**（16 顶层安装 + 4 核心 bundle + 19 聚合包子插件） |
| MCP | 2 个（1 个已加载，1 个配了待重启） |
| 生成索引总体积 | 约 104 KB |

**环境**：DeepSeek Harness 0.1.7-rc.2 / Windows / Node v25.2.1

---

## 七个实测踩过的坑

详见 [`docs/07-pitfalls.md`](docs/07-pitfalls.md)，先说最狠的三个：

### ⚠️ 1. 千万别按目录路径强归类

**本次就踩了**：把 `expert-library/` 整个目录归成「人物视角」，结果 **217 个五花八门的技能全被塞进一个类别** —— 因为那个目录里其实什么都有（Amazon 运营、法律查询、旅行、游戏开发…）。

**分类必须看内容（name + description），不看路径。**

### ⚠️ 2. 规矩必须写进 system prompt 文件

| 做法 | 效果 |
|---|---|
| 对话里说「以后先查技能」 | 只影响当轮，下一轮就忘 |
| 写进 `AGENTS.md` | 每次会话开头自动全量注入，**永远在** |

### ⚠️ 3. 索引只放一句话，细节留给说明书

索引写太长 → 反而拖慢、烧 token。**索引是目录，不是内容。**

其他四个坑：
4. 描述为空不处理 → 索引里一堆「（描述为空）」
5. 分类词表太粗 → 「其他」里堆几十个
6. 改完不重启 → 插件/MCP 配了不生效
7. `command` 相对路径不解析 → MCP 找不到命令

---

## 和「豆包方案」的关系

**原始框架来自豆包**给的 `OpenClaw技能配置`（INDEX.md + SKILL.md 模板 + Agent 系统提示规则）。

**照搬的部分**：
- 索引只放一句话简介
- 说明书命中才读
- 触发场景写用户原话关键词
- 规则必须写进 system prompt

**扩展的部分**：
- **从 1 套扩到 3 套**（技能 / 插件 / MCP），因为三者安装和生效机制完全不同
- **权限声明规范** —— 插件必须说清读写什么、调什么外部服务
- **安全边界 5 问** —— MCP 是外部程序，权限取决于它自己
- **「原生插件 vs MCP 怎么选」** —— 插件集成更深，MCP 只是外挂
- **自动分类脚本** —— 几百个技能人工分类不现实
- **实测验证方法** —— 怎么确认 MCP 真的加载了

**没解决的部分**：
「模型要够强」—— 这套本质是「读文件 → 判断 → 执行」的多步推理。小模型容易读到一半就放弃或猜着干。这不在系统能控范围内。

---

## 适用场景

**适合**：
- agent 拥有 ≥ 20 个技能 / 插件 / MCP
- 发现 agent 经常「有工具不用，自己硬做」
- 想让 agent 的行为**可预测、可审计、可扩展**
- 要在多个 agent 之间**共享同一套能力定义**

**不适合**：
- 只有 3~5 个能力（直接列在 system prompt 里就行，不用索引）
- 能力从不变化（那是一次性配置，不是体系）

---

## License

MIT
