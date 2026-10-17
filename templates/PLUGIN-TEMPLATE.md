---
type: note
tags: [插件模板, DSH, agent]
status: promoted
updated: 2026-10-17
---

# DSH 插件说明书模板（写新插件时照这个）

> **插件是什么**：给 DSH 装上一个新能力的 npm 包。
> **和技能的区别**：技能（SKILL.md）是「怎么干某类活」的说明书；插件是「给 DSH 装上某个能力」的模块。
> **放哪**：`~/.dsh/profiles/desktop/node_modules/<包名>/`
> **怎么登记**：加进 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 数组

---

## 一、package.json 必备字段

```json
{
  "name": "dsh-my-plugin",
  "version": "0.1.0",
  "description": "一句话说清：这个插件给 DSH 加什么能力",
  "type": "module",
  "main": "./dist/index.js",
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    },
    "permissions": {
      "summary": "用大白话写清楚：这个插件会读写什么、调什么外部服务、有什么风险"
    },
    "engines": {
      "dsh": ">=0.1.7-rc.2"
    }
  }
}
```

### 关键字段说明

| 字段 | 作用 | 注意 |
|---|---|---|
| `dsh.bundle.patch` | 插件的 cordis 补丁文件 | 没有就不写 |
| `dsh.permissions.summary` | **权限声明，给人看的** | 必须诚实写：读写哪些路径、调哪些外部 API、失败会怎样 |
| `dsh.engines.dsh` | 要求的最低 DSH 版本 | **写高了装不上**（例：`>=0.2.0-rc.2` 在 0.1.7-rc.2 上装不了） |
| `dsh.client.inject` | 需要注入的客户端服务 | 只在有 Web UI 时需要 |

---

## 二、最重要的：权限声明怎么写

**插件必须诚实声明权限**，否则用户不敢装。

照着这个格式写（参考已装的 `dsh-computer-use`）：

```
"summary": "通过宿主 spawn 以非 shell 固定 argv 调用 cua-driver 原生驱动本地桌面：
  屏幕观测（screen_observe/screen_zoom，AX 树+窗口快照）、
  虚拟鼠标键盘模拟（computer_click/type/key/scroll/drag/wait）、
  应用枚举与启动（app_list/app_launch）。
  内置安全护栏：危险词审批、密码框保护、过期状态拒绝、作用域权限；虚拟光标不抢占真实鼠标。
  核心桌面路径不读取业务文件或额外凭据。"
```

**必须回答清楚这 5 个问题：**

1. **读写什么** —— 哪些目录 / 文件 / 数据库
2. **调什么外部服务** —— 哪些 API、是否发数据出去
3. **怎么执行** —— shell？固定 argv？原生驱动？
4. **有什么安全护栏** —— 审批、保护、超时、作用域
5. **失败会怎样** —— 结构化错误？静默降级？（**静默降级是反模式**）

---

## 三、插件代码结构（参考）

```
dsh-my-plugin/
├── package.json
├── cordis.patch.yml        # 可选：插件自己的配置补丁
├── dist/
│   └── index.js            # 入口，导出 apply(ctx)
└── src/
    └── index.ts
```

**入口最小形态：**

```js
export const name = 'dsh-my-plugin';

export function apply(ctx) {
  // ctx 是 DSH 的插件上下文
  // 注册工具
  ctx.tool('my_tool', {
    description: '这个工具干什么',
    parameters: { /* JSON Schema */ },
    async execute(args) { /* ... */ }
  });

  // 注册服务
  ctx.provide('myService', { /* ... */ });

  // 监听生命周期
  ctx.on('ready', () => { /* ... */ });
}
```

---

## 四、装好后怎么验证

```powershell
# 1. 装包
cd ~/.dsh/profiles/desktop
pnpm add dsh-my-plugin

# 2. 加进 package.json 的 dsh.profile.bundles（顺序即装载顺序）

# 3. 重启 DSH

# 4. 看启动日志有没有报错
#    常见错误：pending (waiting for service: xxx)  ← 说明依赖的服务没起来
```

**验证清单：**

- [ ] 重启后 DSH 能正常打开（没卡在启动）
- [ ] 插件提供的工具在工具列表里出现
- [ ] `cordis.patch.yml` 里能按 id 改它的配置
- [ ] 禁用后（`disabled: true`）不影响其它插件

---

## 五、常见坑

| 坑 | 现象 | 解法 |
|---|---|---|
| **`engines.dsh` 写太高** | 装上了但加载失败 | 先 `dsh --version` 看自己版本，写 `>=` 别写 `^` |
| **bundle 顺序错** | `pending (waiting for service: xxx)` | 被依赖的插件必须排在前面 |
| **客户端注入的服务名写错** | 浏览器端崩溃 | 对照 `@deepseek-ai/dsh-client-*` 的实际导出的服务名 |
| **`cordis.patch.yml` 缩进错** | DSH 直接起不来 | 改完用 Python + pyyaml 校验（记得处理 `!!js` 自定义标签） |
| **改了配置不重启** | 配置不生效 | DSH 只在启动时读 `cordis.patch.yml` |
| **删包而不是禁用** | 依赖它的插件全挂 | 用 `disabled: true`，别 `pnpm remove` |

---

## 六、和技能的分工

| 你想要 | 该做什么 |
|---|---|
| DSH 多一个**工具**（生图、SSH、看板） | **写插件** |
| DSH 多一套**干活流程**（怎么做 PDF、怎么写合同） | **写技能**（SKILL.md） |
| 只是让 AI **知道某个知识** | 存记忆库，不用插件也不用技能 |

---

## 相关文件

- 插件索引：`~/.dsh/PLUGINS-INDEX.zh.md`（39 个插件的中文分类）
- 技能索引：`~/.dsh/SKILLS-INDEX.zh.md`（375 个技能）
- 技能模板：`~/.dsh/SKILL-TEMPLATE.md`
- 常驻规则：`~/.dsh/AGENTS.md`
- 插件配置：`~/.dsh/profiles/desktop/cordis.patch.yml`
