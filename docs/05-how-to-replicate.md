# 怎么复刻（完整步骤）

> 目标：在你自己的 agent 宿主里，从零搭出一套「能力三卷」。
> 预计耗时：**1~2 小时**（取决于能力数量；< 50 个能力可以用手写，> 100 个必须用脚本）。

---

## 第 0 步：先摸家底（不要跳过）

**铁律：不要凭想象写索引，必须扫真实文件。**

### 技能

扫所有 `SKILL.md` 的 frontmatter，拿到 `name` / `description` / `path`：

```bash
# POSIX
find <SKILLS_DIR> -name SKILL.md

# Windows PowerShell
Get-ChildItem -LiteralPath <SKILLS_DIR> -Recurse -File -Filter SKILL.md
```

**要扫的目录**（按宿主不同）：

| 宿主 | 技能目录 |
|---|---|
| DeepSeek Harness | `~/.dsh/skills/`、`~/.agents/skills/` |
| OpenClaw | `~/.openclaw/skills/`、`~/.openclaw/extensions/*/skills/` |
| Claude Code | `~/.claude/skills/`、项目 `.claude/skills/` |

**用现成脚本**：[`tools/dump-skills.cjs`](../tools/dump-skills.cjs)

```bash
node tools/dump-skills.cjs
# → 输出到 %TEMP%/skills-inventory.json
# → 打印 UNIQUE_SKILLS=<数量>
```

### 插件

```bash
cat <HOST_HOME>/profiles/<profile>/package.json
```

要拿到三样：
- `dependencies`（顶层安装的包）
- `dsh.profile.bundles`（**装载顺序**，顺序即依赖顺序）
- 每个包的 `node_modules/<name>/package.json` 里的 `name` / `version` / `description` / `dsh` 字段

**用现成脚本**：[`tools/dump-plugins.cjs`](../tools/dump-plugins.cjs)

### MCP

```bash
grep -n "mcp-" <HOST_HOME>/profiles/<profile>/cordis.patch.yml
```

拿到每个 MCP 的：`serverName` / `transport` / `command` / `args` / `env` / `failOnStartupError`。

**⚠️ 光看配置不够 —— 必须验证真的加载了：**

| 验证方式 | 怎么看 |
|---|---|
| **看工具名** | 工具列表里有没有 `mcp__<serverName>__*` |
| **看进程** | `Get-Process -Name <程序名>` |
| **看时间** | 比对进程启动时间 vs 配置修改时间（配置更晚 = 没生效） |

---

## 第 1 步：写卷一（索引）

### 技能索引

**< 50 个技能**：手写一个 markdown 表格就行。

**> 100 个技能**：必须用脚本。核心逻辑：

```js
// 1. 读所有 SKILL.md，解析 frontmatter
// 2. 按 name + description 的关键词打分归类
// 3. 描述为空的，从正文捞第一句
// 4. 归不进的，加类或人工 override
// 5. 生成 markdown（分类标题 + 表格：技能名 | 用途）
```

**用现成脚本**：[`tools/gen-skills-index.cjs`](../tools/gen-skills-index.cjs)

**分类设计要点**：

| 要点 | 说明 |
|---|---|
| **看内容不看路径** | 目录名反映「谁装的」，不反映「干什么的」 |
| **词表要覆盖真实领域** | 第一次分类后看「其他」里堆了什么，再加类 |
| **每类 5~50 个** | 太多了继续拆，太少了合并 |
| **留人工 override** | 最后几个边角料手动指定 |

**参考分类**（覆盖常见场景）：

```
🎨 网页与视觉设计    📄 文档与办公      🌐 浏览器与自动化
🔍 搜索与研究        💻 开发与代码      📱 移动端与跨端
🎬 图像/视频/音频    📊 电商/营销/商业   🧠 知识/记忆/学习
📝 写作与内容        👤 人物视角/思维   🔧 系统/工具/环境
📈 数据分析          🏢 企业/法律/工商   ✈️ 旅行/生活服务
📰 资讯/内容/阅读    🎮 游戏开发         🤖 AI/Agent 构建
```

### 插件索引

每个插件写清五项：

```markdown
### `包名`  v版本

| 项 | 内容 |
|---|---|
| **中文名** | 生图插件 |
| **用途** | 把 ChatGPT 那样的生图能力搬进宿主：GitHub 上的 Gemini、OpenAI、本地 ComfyUI 等 |
| **提供的能力** | `generate_image`、`edit_image` |
| **装载方式** | package.json dependencies（已装） |
| **权限声明** | 调外部图像 API；不读写本地业务文件 |
```

**必须标出三类角色**：
- `declared` — 顶层安装
- `core-bundle` — 宿主核心（**标「别动」**）
- `sub-of-xxx` — 聚合包的子插件

### MCP 索引

写清：
1. **当前状态**（已加载 / 配了没生效）
2. **怎么验证**
3. **备选清单**（值得装但没装的）+ 风险等级
4. **安全边界**（读写什么 / 调什么外部服务）

---

## 第 2 步：写卷二（模板）

三类各一份模板。每份模板要包含：

| 段 | 技能 | 插件 | MCP |
|---|---|---|---|
| 放置位置 | ✅ | ✅ | ✅ |
| 必填字段 | `name`/`description` | `package.json` + `dsh` 字段 | YAML 配置块 |
| **触发/权限声明** | **用户原话关键词** | **权限 5 问** | **安全 5 问** |
| 安装步骤 | ✅ | ✅ | ✅ |
| 验证清单 | ✅ | ✅ | ✅ |
| 常见坑 | ✅ | ✅ | ✅ |

**技能模板最关键的一点**：

> `description` 必须写进**用户可能说的原话关键词**。
>
> ❌ 不要写：`PDF 处理器`
> ✅ 要写：`当用户提到「PDF、转成PDF、读PDF、PDF填表」时使用`

因为 agent 是靠这句话做匹配的。写功能名 = 永远匹配不上。

**插件模板最关键的一点**：`permissions.summary` 必须诚实回答 5 问：

1. 读写什么？（全盘？指定目录？）
2. 调什么外部服务？（会不会把数据发出去？）
3. 怎么执行？（shell？固定 argv？原生驱动？）
4. 有什么安全护栏？（审批？超时？作用域？）
5. 失败会怎样？（**静默降级是反模式**）

**MCP 模板最关键的一点**：`command` 必须绝对路径。

```yaml
# ❌ 错
command: npx

# ✅ 对
command: 'C:\Program Files\nodejs\node.exe'
args: ['C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js', '-y', '<包名>']
```

---

## 第 3 步：写卷三（规矩）—— 最关键

**把 [`examples/AGENTS.md.example`](../examples/AGENTS.md.example) 的内容追加到宿主机的 system prompt 文件。**

| 宿主 | system prompt 位置 |
|---|---|
| **DeepSeek Harness** | `<DSH_HOME>/AGENTS.md`（用户级）+ 工作区 `AGENTS.md`（项目级） |
| **OpenClaw** | agent 的 persona / system prompt 配置 |
| **Claude Code** | 项目根 `CLAUDE.md` |
| **Cursor** | `.cursorrules` |
| **自研宿主** | 你自己的 system prompt 拼装逻辑 |

**必须包含的 6 条铁规则**：

```
1. 收到任务先查能力索引
2. 命中就读完整说明书再动手，禁止凭印象瞎做
3. 没命中才用通用能力，并告知用户
4. 只读命中项，绝不通读全部
5. 用户点名能力 → 直接读那个，跳过索引
6. 执行完按说明书的输出规范交付，并说明验证结果
```

**验证生效**：改完后宿主的下一轮会发一条 `Updated instructions from: <path>` 的通知。**看到 = 生效了。**

---

## 第 4 步：验证

| 验证项 | 怎么验 | 通过标准 |
|---|---|---|
| **索引可查** | 问 agent「你有哪些能力？」 | 能说出分类和数量，不是瞎编 |
| **规矩生效** | 给一个明显有对应技能的任务 | 它先说「我查一下技能」，再读说明书，再动手 |
| **模板可用** | 照模板加一个新技能 | 加完 agent 能找到并正确使用 |
| **不通读** | 看 token 消耗 | 只读了命中那一份 |
| **索引与真实一致** | 抽查 3 个能力 | 名字、路径、描述都对得上 |

**最硬的验证**：

> **给它一个有对应技能的任务，看它会不会先查。**
> - 会 → ✅ 规矩生效了
> - 直接上手 → ❌ 没生效，回去检查规矩是不是写进了 system prompt

---

## 第 5 步：维护（长期）

**每次新增能力**：

1. 写文件（技能放 `skills/<name>/SKILL.md`，插件装包，MCP 加配置）
2. **在对应索引加一行**（最容易被忘的一步）
3. 技能重载会话 / 插件和 MCP 重启宿主

**定期体检**（建议每月）：

- 索引里的条目 vs 磁盘上的真实文件，数量对不对
- 有没有「装了但索引里没有」的孤儿
- 有没有「索引里有但删掉了」的死链
- 分类是否还合理（新领域出现时要加类）

---

## 时间估算

| 能力数量 | 方式 | 预计耗时 |
|---|---|---|
| < 20 | 全手写 | 30 分钟 |
| 20~100 | 索引手写 + 模板照抄 | 1 小时 |
| > 100 | **必须用脚本** | 1~2 小时（大部分是写脚本） |

**建议**：先做**最常用的 5 个能力**，跑通完整链路（任务 → 查索引 → 读说明书 → 执行 → 验证），**再逐步扩充**。

**先让机制转起来，比一次做全更重要。**
