---
type: note
tags: [MCP模板, DSH, agent]
status: promoted
updated: 2026-10-17
---

# DSH MCP 接入模板（加新 MCP 时照这个）

> **MCP 是什么**：外部程序（Python / Node / Rust 写的都行）通过 MCP 协议，把自己的工具暴露给 DSH。
> **和插件的区别**：插件是 DSH 生态内的 npm 包；**MCP 是任何程序，跨语言、跨生态**。
> **配置在哪**：`~/.dsh/profiles/desktop/cordis.patch.yml` 末尾加 `- id: mcp-xxx`
> **工具名**：`mcp__<serverName>__<toolName>`

---

## 一、最小可用配置

```yaml
- id: mcp-<唯一id>
  config:
    serverName: <名字>          # 工具前缀，会变成 mcp__<名字>__xxx
    transport: stdio             # 目前验证过 stdio
    command: '<绝对路径>'
    args:
      - <参数>
    env:
      <变量>: '<值>'
    failOnStartupError: false
```

**四步走：**

1. `Copy-Item cordis.patch.yml cordis.patch.yml.bak-<时间戳>`（**先备份！**）
2. 照上面模板追加一块
3. 校验 YAML
4. 重启 DSH

---

## 二、三种常见装法

### A. Node 包（npx）

```yaml
- id: mcp-filesystem
  config:
    serverName: filesystem
    transport: stdio
    command: '<node.exe 绝对路径>'
    args:
      - '<npx-cli.js 路径>'          # ← 见下方说明
      - '-y'
      - '@modelcontextprotocol/server-filesystem'
      - 'E:\允许访问的目录'
    env: {}
    failOnStartupError: false
```

**⚠️ `command` 不要写 `npx`**（相对路径在 DSH 里不解析）。
要写 **node 绝对路径 + npx-cli.js 绝对路径**：
```
command: 'C:\Program Files\nodejs\node.exe'
args:
  - 'C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js'
  - '-y'
  - '<包名>'
  - '<参数>'
```

### B. Python 包（uvx）

```yaml
- id: mcp-fetch
  config:
    serverName: fetch
    transport: stdio
    command: 'C:\Users\<你的用户名>\AppData\Local\hermes\bin\uvx.exe'
    args:
      - 'mcp-server-fetch'
    env:
      PYTHONIOENCODING: 'utf-8'
    failOnStartupError: false
```

**建议先预装，避免首次启动超时：**
```powershell
uv tool install mcp-server-fetch
```
装完后可以直接用 `uvx mcp-server-fetch`，也可以指向 `~/.local\bin\mcp-server-fetch.exe`。

### C. 独立可执行文件（exe / 编译产物）

```yaml
- id: mcp-windows
  config:
    serverName: windows
    transport: stdio
    command: 'C:\Users\<你的用户名>\.local\bin\windows-mcp.exe'
    args:
      - serve
      - --tools
      - 'App,Click,Desktop,Type,Wait'
    env:
      ANONYMIZED_TELEMETRY: 'false'
    failOnStartupError: false
```

---

## 三、字段详解

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 配置块唯一标识，**必须 `mcp-` 开头**（DSH 靠这个前缀识别是 MCP） |
| `serverName` | ✅ | 工具前缀。写 `foo` → 工具变成 `mcp__foo__bar`。**必须唯一** |
| `transport` | ✅ | `stdio`（已验证）。`sse` / `streamable-http` 未验证 |
| `command` | ✅ | **绝对路径**。相对路径不解析 |
| `args` | ❌ | 参数数组 |
| `env` | ❌ | 环境变量。**MCP 需要的 token / path 必须显式写** |
| `failOnStartupError` | ❌ | `true` = 起不来就整个 DSH 失败。**一律写 `false`** |

**`!!js` 表达式**：cordis 支持算配置值，用于路径依赖运行时环境：

```yaml
command: !!js process.execPath      # 当前 Node 可执行文件
args:
  - !!js "(process.env.DSH_HOME || process.env.USERPROFILE + '/.dsh') + '/bin/xxx.mjs'"
```

**能用字面量就别用 `!!js`** —— 排查困难，写错了 DSH 直接起不来。

---

## 四、验证清单

```powershell
# 1. YAML 语法（注意处理 !!js 自定义标签）
python -c "
import yaml, io
class L(yaml.SafeLoader): pass
L.add_multi_constructor('tag:yaml.org,2002:js', lambda *a: '<js>')
L.add_multi_constructor('!', lambda *a: '<expr>')
d = yaml.load(io.open(r'C:\Users\<你的用户名>\.dsh\profiles\desktop\cordis.patch.yml', encoding='utf-8'), Loader=L)
print('entries:', len(d))
print([x['id'] for x in d])
"

# 2. 重启 DSH 后，看工具列表里有没有 mcp__<serverName>__*

# 3. 看 MCP 进程有没有跑起来
Get-Process -Name '<程序名>'
```

**通过标准：**

- [ ] DSH 正常启动（没卡在启动画面）
- [ ] 工具列表出现 `mcp__<serverName>__*`
- [ ] 该 MCP 的进程在任务管理器里能看到
- [ ] `failOnStartupError: false` 时，MCP 挂了不影响 DSH

---

## 五、常见坑

| 坑 | 现象 | 解法 |
|---|---|---|
| **配了不重启** | 工具列表没变化 | DSH 只在启动时读配置 |
| **`command` 写 `npx`** | 找不到命令 | 写 node 绝对路径 + npx-cli.js |
| **首次启动超时** | 工具没注册 | 先 `uv tool install` / `npx -y <包> --help` 预装 |
| **`failOnStartupError: true`** | 一个 MCP 挂了 DSH 起不来 | 一律 `false` |
| **serverName 重复** | 工具互相覆盖 | 改名 |
| **env 没传** | MCP 报缺 token / 缺 path | 在 `env:` 里显式列 |
| **`!!js` 写错** | YAML 解析失败，DSH 起不来 | 用字面量 |
| **`--tools` 白名单名字写错** | 该 MCP 一个工具都没了 | 先不加 `--tools` 跑通，再收窄 |

---

## 六、安全边界（加 MCP 前必须回答的 5 个问题）

豆包那套没提这点，但**MCP 是外部程序，权限取决于它自己**：

1. **读写什么？** —— 全盘？指定目录？
2. **调什么外部服务？** —— 会不会把数据发出去？
3. **能执行命令吗？** —— 能就是最高权限。
4. **有护栏吗？** —— 审批 / 超时 / 作用域。
5. **失败了会怎样？** —— 明确报错还是静默降级（**静默降级是反模式**）。

**降低风险：**

- 用 `--tools` 白名单只开需要的（Windows-MCP 就是这么做的：18→11）
- 用 `--exclude-tools` 屏蔽危险的（PowerShell / Registry / FileSystem）
- **高危 MCP 单独装，别和日常用的混在一起**

---

## 七、DSH 原生插件 vs MCP：怎么选

**关键原则：DSH 原生插件能干的，别装 MCP。**

| 需求 | DSH 原生插件 | 通用 MCP | 选哪个 |
|---|---|---|---|
| 桌面操作 | `dsh-computer-use`（虚拟鼠标） | windows-mcp（真动鼠标） | **插件**（更安全，有护栏） |
| 看图 | `@liustack/modlens` ✅已装 | — | 插件 |
| 生图 | `dsh-image-gen` ✅已装 | — | 插件 |
| 记忆 | `dsh-obsidian-memory` ✅已装 | memory MCP | 插件 |
| 浏览器 | — | playwright / puppeteer | MCP |
| GitHub | — | github MCP | MCP |
| 数据库 | — | sqlite / postgres MCP | MCP |
| 逆向工程 | — | — | `dsh-plugin-rea` ✅已装 |

**为什么优先插件**：插件能拿到 `ctx`（注册工具、提供服务、加 UI、监听生命周期），集成深；MCP 只能注册工具，是「外挂」。

---

## 相关文件

- MCP 索引：`~/.dsh/MCP-INDEX.zh.md`
- 技能索引 / 模板：`~/.dsh/SKILLS-INDEX.zh.md`、`~/.dsh/SKILL-TEMPLATE.md`
- 插件索引 / 模板：`~/.dsh/PLUGINS-INDEX.zh.md`、`~/.dsh/PLUGIN-TEMPLATE.md`
- 配置：`~/.dsh/profiles/desktop/cordis.patch.yml`
- 常驻规则：`~/.dsh/AGENTS.md`
