# 七个实测踩过的坑

> 全部来自真实实施过程（375 个技能 / 39 个插件 / 2 个 MCP）。
> 按「踩到的惨烈程度」排序。

---

## ⚠️⚠️⚠️ 1. 千万别按目录路径强归类

**最惨的一个。**

**发生了什么**：技能在两个目录下 —— `~/.dsh/skills/`（231 个）和 `~/.agents/skills/`（173 个）。

其中 `~/.dsh/skills/expert-library/qclaw/` 里有 **217 个**技能。我一看目录名叫 `expert-library`，就想「这肯定是专家角色库」，于是加了条规则：

```js
if (path.includes('expert-library')) return 'persona';  // ❌ 灾难
```

**结果**：

```
👤 人物视角 / 思维模型  217   ← 塞满了五花八门的东西
💻 开发与代码            3    ← 本该 45 个，全被抢走了
```

**因为那个目录里其实什么都有**：Amazon 运营、法律查询、旅行服务、游戏开发、图片处理、多智能体协作……它只是"从 QClaw 搬过来的一个大杂烩"，**不是按内容分类的**。

**正确做法**：

```js
// ✅ 按 name + description 的内容打分归类
const hay = (skill.name + ' ' + skill.desc).toLowerCase();
let best = null, bestScore = 0;
for (const c of CATEGORIES) {
  const sc = score(hay, c.keywords);
  if (sc > bestScore) { bestScore = sc; best = c; }
}
```

**教训**：**分类看内容，不看路径。** 目录结构反映的是「谁装的」，不是「干什么的」。

---

## ⚠️⚠️ 2. 规矩必须写进 system prompt 文件

**这是整套方法能不能生效的生死线。**

| 做法 | 效果 |
|---|---|
| 在对话里说「以后每次开工先查技能」 | ⚠️ 这一轮照做，**下一条消息可能就忘了** |
| 把这条写进 `AGENTS.md` | ✅ 每次会话开头自动全量注入，**永远在** |

**原理**：system prompt 是每轮都送的；对话内容只影响当前上下文窗口。

**验证方法**：改完 system prompt 文件后，宿主的下一轮会发一条类似这样的通知：

```
Updated instructions from: <path>
This file changed after it was loaded. Use the following content instead...
```

**看到这条 = 生效了。没看到 = 你可能改错文件了。**

---

## ⚠️⚠️ 3. 索引只放一句话，细节留给说明书

**索引写太长的后果**：反而拖慢、烧 token，而且**agent 会忍不住在索引里就开始做判断**。

**正确比例**：

| 文件 | 每项字数 | 举例 |
|---|---|---|
| **索引** | **20~120 字** | `| \`pdf\` | PDF 读取/创建/转换/填表 |` |
| **说明书** | **500~2000 字** | 完整步骤、前置条件、输出规范、注意事项 |

**索引是目录，不是内容。** 谁在索引里写步骤，谁就白做了这套体系。

---

## ⚠️ 4. 描述为空不处理 → 索引里一堆「（描述为空）」

**现象**：扫出来 13 个技能的 `description` 是空的。

**原因**：那 13 个都在 `expert-library/qclaw/` 里，专家角色技能通常靠**目录名**表达身份，不写 `description`。

**解法**：从 `SKILL.md` 正文捞第一句有意义的话，**但要跳过噪音行**：

```js
function fallbackDesc(skill) {
  const body = readFile(skill.path).replace(/^---[\s\S]*?---/, '').trim();
  const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const l of lines) {
    if (l.startsWith('#')) continue;    // 跳过标题
    if (l.startsWith('|')) continue;    // 跳过表格
    if (l.length > 8) return l.slice(0, 140);
  }
  return '';
}
```

**踩坑提醒**：我第一次没跳过「来源: https://...」这种行，结果索引里出现一堆「来源: https://www.skillsbot.cn/skill/6521」当描述。**要过滤明显的元信息行。**

---

## ⚠️ 5. 分类词表太粗 → 「其他」里堆几十个

**第一次分类结果**：342 归类 / **33 个其他**。

**原因**：词表只覆盖了常见的（文档、网页、开发、设计），漏掉了一整块真实存在的领域：

- 企业查询（企查查、企百科、元典智库）
- 旅行服务（携程、同程、美团、百度地图）
- 资讯阅读（新闻、微信读书、公众号文风）
- 游戏开发
- AI Agent 构建（女娲造人、多智能体协作）

**正确做法**：**加类，不要硬塞。**

```js
{ key: 'enterprise', title: '🏢 企业 / 法律 / 工商查询',
  kw: ['qcc', 'qibook', '企查查', '工商', '股权', '尽调', 'contract', 'legal', '专利', '税务'] },
{ key: 'travel', title: '✈️ 旅行 / 生活服务',
  kw: ['travel', 'hotel', 'flight', '携程', '同程', '美团', '地图', '行程', '攻略'] },
```

**最终结果**：18 个分类，**375 / 375 全部归类，0 个「其他」**。

剩下实在归不进的几个，用**人工 override**：

```js
const OVERRIDES = {
  '25-个人知识库架构师': { cat: 'knowledge', desc: '个人知识库架构设计专家角色' },
  'creative-ideation': { cat: 'writing', desc: '用创意约束批量生成项目点子' },
};
```

---

## ⚠️ 6. 改完不重启 → 插件/MCP 配了不生效

**三类东西的生效时机完全不同**：

| 类型 | 改完要做什么 |
|---|---|
| **技能** | 重载会话（`<available_skills>` 是会话启动时扫描的） |
| **插件** | **重启宿主** |
| **MCP** | **重启宿主** |

**本次实例**：

```
宿主进程启动:  17:55:03
MCP 配置修改:  19:53:50   ← 比启动晚 2 小时
→ MCP 一直没加载，日志里也没有，工具列表里也没有
```

**判断方法**：比对「进程启动时间」和「配置修改时间」。配置更晚 = 一定没生效。

---

## ⚠️ 7. `command` 写相对路径 → MCP 找不到命令

**错误写法**：

```yaml
command: npx          # ❌ 不解析
args: ['-y', '@modelcontextprotocol/server-filesystem']
```

**正确写法**（必须绝对路径）：

```yaml
command: 'C:\Program Files\nodejs\node.exe'
args:
  - 'C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js'
  - '-y'
  - '@modelcontextprotocol/server-filesystem'
  - 'E:\allowed-dir'
```

**Python 包同理**：写 `uvx.exe` 的绝对路径，不要写 `uvx`。

**其他 MCP 相关坑**：

| 坑 | 现象 | 解法 |
|---|---|---|
| `failOnStartupError: true` | 一个 MCP 挂了宿主整个起不来 | 一律 `false` |
| `serverName` 重复 | 两个 MCP 工具互相覆盖 | `serverName` 必须唯一 |
| 首次启动超时 | MCP 进程起了但工具没注册 | 先 `uv tool install` / `npm i -g` 预装 |
| `--tools` 白名单名字写错 | 该 MCP 一个工具都没了 | **先不加白名单跑通，再逐步收窄** |

---

## 附：一个额外发现的坑（script 层面）

**`node -e` 里的反斜杠会被转义吃掉。**

```powershell
# ❌ 这个在 node -e 里跑，Windows 路径判断全失效
node -e "if (p.startsWith('C:\\\\Users')) ..."
```

**解法**：写成 `.cjs` 文件跑，别用 `-e` 内联长脚本。

**本次表现**：所有 `startsWith(selfDir)` 判断都返回 `false`，导致「插件在不在扩展目录」全判错。改成脚本文件后立刻正常。

---

## 总结：这七个坑的共同点

**都是「凭想象」造成的。**

| 凭想象 | 实际 |
|---|---|
| 目录名 = 内容 | 目录名 = 谁装的 |
| 对话里说了 = 记住了 | 只有 system prompt 是常驻的 |
| 分类词表够了 | 只覆盖了你想得到的领域 |
| 描述都有 | 13 个是空的 |
| 配置改了 = 生效了 | 要重启 |
| `npx` 能跑 | 相对路径不解析 |
| `node -e` 能用 | 反斜杠会丢 |

**所以第一步永远是：先摸家底（扫真实文件），再动手写。**
