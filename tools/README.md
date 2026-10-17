# 工具脚本

四个脚本，用来**扫描能力清单**和**生成分类索引**。

> 都是纯 Node.js，无外部依赖。用 `node <脚本>` 直接跑。

---

## 1. `dump-skills.cjs` — 扫描技能清单

**做什么**：递归扫两个技能目录下的所有 `SKILL.md`，解析 frontmatter，去重，输出 JSON。

**输出**：`%TEMP%/skills-inventory.json`（格式：`[{ name, desc, path }]`）

**跑法**：

```bash
node tools/dump-skills.cjs
```

**输出示例**：

```
UNIQUE_SKILLS=375
written to %TEMP%\skills-inventory.json
```

**要改的地方**：脚本顶部的 `dirs` 数组 —— 换成你宿主的技能目录。

```js
const dirs = [
  path.join(HOME, '.dsh', 'skills'),
  path.join(HOME, '.agents', 'skills'),
];
```

---

## 2. `gen-skills-index.cjs` — 生成技能索引

**做什么**：读 `skills-inventory.json`，按关键词打分归类，生成中文 markdown 索引。

**输入**：`%TEMP%/skills-inventory.json`（先跑 `dump-skills.cjs`）
**输出**：`~/.dsh/SKILLS-INDEX.zh.md`

**跑法**：

```bash
node tools/gen-skills-index.cjs
```

**输出示例**：

```
WROTE C:\Users\...\.dsh\SKILLS-INDEX.zh.md
BYTES 76301
CATEGORIZED 375 / OTHER 0
  🎨 网页与视觉设计  156
  📄 文档与办公  47
  ...
```

**核心逻辑**：

1. `CATEGORIES` 数组里每个分类有 `key / title / hint / kw`（关键词列表）
2. 每个技能按 `name + desc` 命中多少关键词打分，归到最高分的类
3. 描述为空的，从 `SKILL.md` 正文捞第一句（`fallbackDesc`）
4. 剩几个归不进的，用 `OVERRIDES` 人工指定
5. 生成 markdown

**要改的地方**：

| 改什么 | 在哪 |
|---|---|
| 分类和关键词 | `CATEGORIES` 数组 |
| 人工兜底 | `OVERRIDES` 对象 |
| 输出路径 | 脚本末尾 `dest` |
| 输出文件名 | 同上 |

**调优建议**：

- 第一次跑完看「其他」里堆了什么 → **加类，不要硬塞**
- 每类 5~50 个：太多了继续拆，太少了合并
- ⚠️ **不要按目录路径强归类** —— 目录名反映「谁装的」，不反映「干什么的」

---

## 3. `dump-plugins.cjs` — 扫描插件清单

**做什么**：读宿主的 profile `package.json`，收集三类插件信息：
- `declared`（顶层安装）
- `core-bundle`（宿主核心）
- `sub-of-web-all`（聚合包的子插件）

**输出**：`%TEMP%/dsh-plugins.json`

**跑法**：

```bash
node tools/dump-plugins.cjs
```

**要改的地方**：脚本顶部的 `profileDir` —— 换成你宿主的 profile 目录。

```js
const profileDir = path.join(HOME, '.dsh', 'profiles', 'desktop');
```

**针对其他宿主的改法**：

| 宿主 | 怎么改 |
|---|---|
| OpenClaw | 读 `openclaw plugins list --json`（核内命令），不用读 package.json |
| 通用 npm 项目 | 直接读 `package.json` 的 `dependencies` + `node_modules` |

---

## 4. `gen-plugins-index.cjs` — 生成插件索引

**做什么**：读 `dsh-plugins.json`，按人工整理的 `META` 表生成中文插件索引。

**输入**：`%TEMP%/dsh-plugins.json`
**输出**：`~/.dsh/PLUGINS-INDEX.zh.md`

**跑法**：

```bash
node tools/gen-plugins-index.cjs
```

**为什么插件要人工整理**：插件数量少（本实例 39 个），而且每个插件的「用途」「提供的能力」「权限声明」需要人读代码判断，**纯关键词归类不可靠**。

**要改的地方**：`META` 对象 —— 每个插件一条：

```js
'包名': {
  cat: '分类key',      // core | agg | agent | ui | tool | memory | notify
  cn: '中文名',
  use: '一句话用途（可以长一点，插件索引允许详细）',
  caps: '提供的能力（工具名 / 命令行 / UI）',
},
```

---

## 完整流程

```bash
# 1. 扫家底
node tools/dump-skills.cjs
node tools/dump-plugins.cjs

# 2. 生成索引
node tools/gen-skills-index.cjs
node tools/gen-plugins-index.cjs

# 3. 检查产物
#    ~/.dsh/SKILLS-INDEX.zh.md
#    ~/.dsh/PLUGINS-INDEX.zh.md
```

---

## 已知限制

| 限制 | 说明 |
|---|---|
| **Windows 路径分隔符** | 脚本用 `path.join`，跨平台没问题；但**别用 `node -e` 内联跑**，反斜杠会被吃掉 |
| **只支持 markdown frontmatter** | `SKILL.md` 必须是 `--- name: / description: ---` 格式 |
| **关键词归类不完美** | 人工 override 是必要的兜底，不是可有可无的 |
| **生成结果含本机路径** | 生成的索引不要提交到 Git（`.gitignore` 已排除） |

---

## License

MIT（同主项目）
