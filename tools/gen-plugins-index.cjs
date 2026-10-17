/**
 * 生成 DSH 插件中文索引
 * 输入: %TEMP%\dsh-plugins.json（dump-plugins2.cjs 产出）
 * 输出: ~/.dsh/PLUGINS-INDEX.zh.md
 */
const fs = require('fs');
const path = require('path');

const HOME = process.env.USERPROFILE;
const inv = JSON.parse(fs.readFileSync(path.join(process.env.TEMP, 'dsh-plugins.json'), 'utf8'));
const byName = new Map(inv.map(p => [p.name, p]));

// 人工整理：中文名 / 中文用途 / 分类 / 关键能力
const META = {
  // ── 核心运行时 ──
  '@deepseek-ai/dsh-base': {
    cat: 'core', cn: 'DSH 基础运行时', use: 'DSH 的宿主内核：会话、模型、工具、权限、沙箱、MCP 客户端等全部基础能力。**不要动**。',
    caps: '工具注册、模型调用、权限预设、MCP 客户端、文件沙箱',
  },
  '@deepseek-ai/dsh-web-app': {
    cat: 'core', cn: 'DSH Web 应用壳', use: 'Web GUI 的主壳：聊天界面、设置页、会话列表、插件加载器。**不要动**。',
    caps: '聊天 UI、设置、会话管理',
  },
  '@deepseek-ai/dsh-experimental-agent-team-profile': {
    cat: 'core', cn: '实验性：Agent Teams 预设', use: 'DSH 官方的实验性多智能体团队预设（Team Lead + 多成员）。',
    caps: '多智能体协作、共享任务板',
  },
  '@deepseek-ai/dsh-experimental-auto-review': {
    cat: 'core', cn: '实验性：自动审查', use: 'DSH 官方的实验性自动审查钩子。',
    caps: '自动审查',
  },

  // ── 聚合 / 市场 ──
  '@linxin666/dsh-web-all': {
    cat: 'agg', cn: 'Web UI 全家桶', use: '一键装齐所有 Web 界面增强插件（19 个子插件）。装它的子插件不用单独装。',
    caps: '聚合 19 个 UI 插件',
  },
  'dshmarket': {
    cat: 'agg', cn: '插件市场', use: 'DSH 内的可视化插件市场：浏览、搜索、一键安装社区插件。',
    caps: '插件浏览 / 搜索 / 一键安装',
  },

  // ── 智能体与协作 ──
  '@joekytc/dsh-swarm': {
    cat: 'agent', cn: '六智能体蜂群', use: '6 个专职 agent（编排/规划/知识库桥/开发/两个审查）按严格阶段流水线把需求做成可验收的交付。',
    caps: '需求→方案→开发→审查流水线、机器验证',
  },
  '@nanmicoder/dsh-agent-teams': {
    cat: 'agent', cn: '多智能体团队', use: '用自然语言组建 Agent 团队：队长 + 成员 + 带依赖的任务 + 成员间通讯，Web GUI 有树状监视器。',
    caps: 'spawn_teammate、共享任务板、team_task_* 工具',
  },
  'dsh-plugin-yolo': {
    cat: 'agent', cn: 'YOLO 个人助理', use: '从对话里整理你的承诺、跨会话跟踪计划、低打扰提醒。',
    caps: '承诺提取、计划跟踪、提醒',
  },
  '@linxin666/dsh-liangshen': {
    cat: 'agent', cn: '梁神预设', use: '梁神（LiangShen）agent 预设 + 输入框快捷开关。',
    caps: 'agent 预设',
  },
  'dsh-doublecheck': {
    cat: 'agent', cn: '交付质量门', use: '交付前四道关：需求拷问 → 红绿测试 → 对抗自审 → 出双检报告。防止「代码过了但没用」。',
    caps: 'grill-requirements、red-green-tdd、delivery-review、doublecheck_report',
  },
  'dsh-ponytail-skills': {
    cat: 'agent', cn: '懒人开发模式（Ponytail）', use: '6 个技能，逼出「最短能用」方案：先问这需求要不要做、能用标准库就别写、能一行别写五十行。',
    caps: 'ponytail / audit / debt / gain / help / review',
  },

  // ── 界面与交互 ──
  '@changfenhuang/dsh-genui': {
    cat: 'ui', cn: 'GenUI 交互组件', use: '在回复里内联渲染交互式 UI（```dsh-ui 围栏）：布局、图表、表单、测验、mermaid、3D 场景，带动作回传。',
    caps: 'render_ui、validate_dsh_ui、```dsh-ui 围栏',
  },
  '@changfenhuang/dsh-annotation': {
    cat: 'ui', cn: '选区批注', use: '选中 AI 回复里的文字 → 写批注 → 回车发送，模型按编号逐条回应。',
    caps: '选中文本批注、按编号回复',
  },
  'dsh-dock': {
    cat: 'ui', cn: '功能坞', use: '模块化功能中枢：用量记账（多段分时价/谷价）、模型设置、图片理解代理、余额查询、19 种任务动画、桌面伙伴、任务通知。',
    caps: '用量/费用统计、视觉代理、余额、动画、通知',
  },
  '@linxin666/dsh-client-ui-skin-center': {
    cat: 'ui', cn: '皮肤中心', use: 'Web GUI 换肤：皮肤是纯资源目录（内置 + ~/.dsh/skins），支持在线试穿、一键应用。',
    caps: '换肤、在线试穿',
  },
  '@linxin666/dsh-pet': {
    cat: 'ui', cn: '多桌宠', use: '注册表驱动的浮动桌宠，随模型活动做出反应，可命名、抚摸、投喂，有亲密度。',
    caps: '桌宠、互动、亲密度',
  },
  '@linxin666/dsh-remote-web-ui': {
    cat: 'ui', cn: '扫码远程访问', use: '设置按钮旁的二维码，扫一下把手机/另一台电脑接进同一个 Web GUI（手机有竖屏适配）。',
    caps: '扫码配对、手机适配',
  },
  '@linxin666/dsh-client-ui-model-capabilities': {
    cat: 'ui', cn: '模型能力声明', use: '给自定义 pi-ai 模型逐个声明能力（能不能读图、推理强度档位），在模型设置卡片上就地编辑，写官方 llm-pi-ai 设置命名空间。',
    caps: '模型能力声明（图片输入 / reasoning efforts）',
  },
  '@linxin666/dsh-client-ui-web-ui-settings': {
    cat: 'ui', cn: 'Web UI 设置宿主', use: '设置页里的一个一级分区，集中放 dsh-web 系列插件的开关和配置表单。',
    caps: '统一设置入口',
  },
  '@linxin666/dsh-client-ui-community-plugins': {
    cat: 'ui', cn: '社区插件索引', use: 'community.json 数据源：工坊商店和 dsh-market.com 的插件清单都从这里来。',
    caps: '社区插件清单数据源',
  },
  '@linxin666/dsh-client-ui-market': {
    cat: 'ui', cn: '商店浏览器', use: '在 GUI 里逛皮肤、桌宠、社区插件并从 dsh-market.com 安装。',
    caps: '皮肤/桌宠/插件浏览安装',
  },
  '@linxin666/dsh-client-ui-preset-center': {
    cat: 'ui', cn: '社区预设中心', use: '管理从 dsh-market.com 下载的 agent 预设：安装、声明、禁用、卸载。',
    caps: '预设管理',
  },
  '@linxin666/dsh-i18n': {
    cat: 'ui', cn: '语言包（俄语）', use: '给 Web GUI 注册 Русский 语言，并集中携带各插件的俄语词典（缺的键回退英文）。',
    caps: '多语言字典',
  },

  // ── 工具与能力 ──
  'dsh-plugin-rea': {
    cat: 'tool', cn: 'REA 逆向工程', use: '一体包：自动准备 Node/REA/JDK/Ghidra，把上游 REA 的 MCP 服务接进来，提供 ~100 个 mcp__rea__* 工具。',
    caps: '原生二进制分析、反编译、MCP 观测、证据链',
  },
  'dsh-image-gen': {
    cat: 'tool', cn: '图像生成', use: '把 ChatGPT 那样的生图能力搬进 DSH：Gemini、OpenAI、Seedream、DashScope、本地 ComfyUI 等。',
    caps: 'generate_image、edit_image、无限画布',
  },
  '@liustack/modlens': {
    cat: 'tool', cn: '视觉桥（ModLens）', use: '给纯文本模型装眼睛：通过免费的 Antigravity CLI 读图，返回 OCR 全文 + 版式 + 语义 + 不确定项。',
    caps: 'modlens_read_image',
  },
  '@linxin666/dsh-ssh': {
    cat: 'tool', cn: 'SSH 远程操作', use: '远程 SSH：主机配置（~/.dsh/dsh-ssh.json，可从 ~/.ssh/config 导入）、连接池、跳板机、exec / 网页终端 / SFTP。',
    caps: 'SSH 执行、PTY 终端、SFTP',
  },
  'dsh-cron-panel': {
    cat: 'tool', cn: '定时任务面板', use: '侧栏面板管理 DSH 提醒和系统 crontab 条目，可全屏编辑。',
    caps: 'schedule_create/update/delete、crontab',
  },
  '@linxin666/dsh-client-ui-task-board': {
    cat: 'tool', cn: '任务看板', use: 'Host 权威的任务看板：真实会话执行、Host cron 调度、可选空闲休眠保护。',
    caps: 'task_board_*（创建/运行/管理/排期）',
  },
  '@linxin666/dsh-client-ui-task-board-github': {
    cat: 'tool', cn: '任务看板 GitHub 同步', use: '把 GitHub Issue 同步进任务看板，支持建 PR、评论、关 Issue。',
    caps: 'task_board_github_*',
  },
  '@linxin666/dsh-client-ui-git-graph': {
    cat: 'tool', cn: 'Git 分支图', use: '空白会话里的 Git 分支选择器 + 提交图，带真实宿主侧 git 操作和守卫。',
    caps: '分支切换、提交图',
  },
  '@linxin666/dsh-client-ui-skill-explorer': {
    cat: 'tool', cn: '技能中心', use: '按来源（内置/项目/用户/自定义/运行时）浏览已加载技能，可启用/禁用/新建/删除。',
    caps: '技能浏览与管理',
  },
  '@linxin666/dsh-client-ui-plugin-manager': {
    cat: 'tool', cn: '插件更新检查', use: '拿已装插件和 registry 上的版本对比，按发布声明的 DSH 最低版本做门控。',
    caps: '版本检查、更新门控',
  },
  '@linxin666/dsh-session-archive': {
    cat: 'tool', cn: '会话归档', use: '集中清单、批量归档/恢复、物理删除（带家族级联），可选自动归档/自动清理策略。',
    caps: '归档、恢复、删除',
  },
  '@linxin666/dsh-update': {
    cat: 'tool', cn: '自更新', use: '探测 npm 上的新版本，就地跑 profile 的 pnpm update，带更新日志面板。',
    caps: '版本探测、就地升级',
  },
  '@linxin666/dsh-usage': {
    cat: 'tool', cn: '用量统计', use: '各 provider 余额与编码套餐配额检测 + 实时 token 用量账本，侧栏设置行上方有紧凑价格卡。',
    caps: '余额、配额、token 账本',
  },

  // ── 记忆与知识 ──
  'dsh-obsidian-memory': {
    cat: 'memory', cn: 'Obsidian 长期记忆', use: '跨会话长期记忆（人物/项目/经验）：自动记忆钩子、动态工具、每天 12:00 蒸馏。**本客户端的记忆规矩就靠它**。',
    caps: 'memory_store、remember、memory_search、Obsidian MCP',
  },

  // ── 通知 ──
  '@lyhalal/dsh-notification-center': {
    cat: 'notify', cn: '通知中心', use: '对话/任务完成、报错、等待批准等事件触发浏览器通知 + 21 种音效，每类事件可独立配音量/开关。',
    caps: '浏览器通知、音效',
  },
};

const CATS = [
  { key: 'core', title: '🧠 核心运行时（DSH 自带，别动）' },
  { key: 'agg', title: '📦 聚合包 / 市场' },
  { key: 'agent', title: '🤖 智能体与协作' },
  { key: 'ui', title: '🎨 界面与交互' },
  { key: 'tool', title: '🛠 工具与能力' },
  { key: 'memory', title: '🗂 记忆与知识' },
  { key: 'notify', title: '🔔 通知' },
  { key: 'other', title: '❓ 未归类' },
];

const buckets = new Map(CATS.map(c => [c.key, []]));
for (const p of inv) {
  const m = META[p.name];
  const k = m ? m.cat : 'other';
  buckets.get(k).push({ ...p, cn: m ? m.cn : p.name, use: m ? m.use : (p.desc || '（无描述）'), caps: m ? m.caps : '' });
}

const now = new Date().toISOString().slice(0, 10);
let out = '';
out += '---\n';
out += 'type: note\n';
out += 'tags: [插件索引, DSH, agent]\n';
out += 'status: promoted\n';
out += 'updated: ' + now + '\n';
out += '---\n\n';
out += '# DSH 插件索引（中文版）\n\n';
out += '> **这份文件是给「我」（DSH agent）自己看的插件清单。**\n';
out += '>\n';
out += '> 技能（SKILL.md）是「怎么干某类活」的说明书；插件（plugin）是「给 DSH 装上某个能力」的模块。两者不是一回事。\n';
out += '> 技能索引见 `~/.dsh/SKILLS-INDEX.zh.md`。\n\n';
out += '> **插件在哪**：`~/.dsh/profiles/desktop/node_modules/`，由 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 决定装载顺序。\n';
out += '> **配置在哪**：`~/.dsh/profiles/desktop/cordis.patch.yml`（按 id 覆盖配置、禁用插件、插 MCP）。\n\n';
out += '---\n\n';
out += '## 统计\n\n';
out += '| 项 | 数量 |\n|---|---|\n';
out += '| 插件总数 | **' + inv.length + '** |\n';
out += '| 顶层安装（package.json dependencies） | ' + inv.filter(p => p.declared).length + ' |\n';
out += '| DSH 核心 bundle | ' + inv.filter(p => p.role === 'core-bundle').length + ' |\n';
out += '| dsh-web-all 子插件 | ' + inv.filter(p => p.role === 'sub-of-web-all').length + ' |\n\n';
out += '## 分类速查\n\n';
out += '| 分类 | 数量 |\n|---|---|\n';
for (const c of CATS) {
  const n = buckets.get(c.key).length;
  if (n) out += '| ' + c.title + ' | ' + n + ' |\n';
}
out += '\n---\n\n';

out += '## ⚠️ 插件使用规则（我每次开工前照这个走）\n\n';
out += '1. **先查本文件**：用户提到某个能力（生图、通知、看板、SSH、逆向、多智能体…）时，先看有没有对应插件已装；\n';
out += '2. **已装就用插件提供的工具**，不要自己手搓（例：要生图用 `generate_image`，别去调 API）；\n';
out += '3. **没装但需要**：告诉用户「这个能力需要装 XXX 插件」，并给出 npm 包名；\n';
out += '4. **改配置前先备份** `cordis.patch.yml`（`copy-Item` 加时间戳后缀）；\n';
out += '5. **禁用插件用 `cordis.patch.yml` 的 `disabled: true`**，不要删包；\n';
out += '6. **改了 cordis.patch.yml 必须重启 DSH 才生效** —— 要先告诉用户会中断会话。\n\n';
out += '---\n\n';

for (const c of CATS) {
  const items = buckets.get(c.key).sort((a, b) => a.name.localeCompare(b.name));
  if (!items.length) continue;
  out += '## ' + c.title + '（' + items.length + '）\n\n';
  for (const p of items) {
    out += '### `' + p.name + '`  v' + p.version + '\n\n';
    out += '| 项 | 内容 |\n|---|---|\n';
    out += '| **中文名** | ' + p.cn + ' |\n';
    out += '| **用途** | ' + p.use + ' |\n';
    if (p.caps) out += '| **提供的能力** | ' + p.caps + ' |\n';
    out += '| **装载方式** | ' + (p.role === 'declared' ? 'package.json dependencies（已装）'
      : p.role === 'core-bundle' ? 'DSH 核心 bundle'
      : p.role === 'sub-of-web-all' ? '随 @linxin666/dsh-web-all 装入' : '其它') + ' |\n';
    if (p.clientInject) out += '| **客户端注入** | ' + p.clientInject.join(', ') + ' |\n';
    if (p.permissions) out += '| **权限声明** | ' + String(p.permissions).slice(0, 200) + ' |\n';
    out += '\n';
  }
}

out += '---\n\n';
out += '## 怎么装一个新插件\n\n';
out += '```powershell\n';
out += '# 1. 进 profile 目录\n';
out += 'cd ~/.dsh/profiles/desktop\n\n';
out += '# 2. 装包（pnpm，和 DSH 一致）\n';
out += 'pnpm add <包名>\n\n';
out += '# 3. 把它加进 package.json 的 dsh.profile.bundles 数组\n';
out += '#    （顺序即装载顺序，依赖别人的要排在后面）\n\n';
out += '# 4. 重启 DSH\n';
out += '```\n\n';
out += '**验证**：重启后 `~/.dsh/profiles/desktop/cordis.patch.yml` 里能按 id 改它配置；\n';
out += '插件失败会在 DSH 启动日志里报 `pending (waiting for service: xxx)`。\n\n';

out += '---\n\n';
out += '## 怎么禁用 / 改配置\n\n';
out += '在 `~/.dsh/profiles/desktop/cordis.patch.yml` 末尾追加：\n\n';
out += '```yaml\n';
out += '# 禁用某个插件\n';
out += '- id: <插件id>\n';
out += '  disabled: true\n\n';
out += '# 改某个插件的配置\n';
out += '- id: <插件id>\n';
out += '  config:\n';
out += '    someKey: someValue\n';
out += '```\n\n';
out += '**插件 id 怎么找**：看该插件 `package.json` 里 `dsh` 字段，或启动日志里的 `[loader] xxx` 行。\n';

const dest = path.join(HOME, '.dsh', 'PLUGINS-INDEX.zh.md');
fs.writeFileSync(dest, out, 'utf8');
console.log('WROTE ' + dest);
console.log('BYTES ' + Buffer.byteLength(out, 'utf8'));
for (const c of CATS) {
  const n = buckets.get(c.key).length;
  if (n) console.log('  ' + c.title + '  ' + n);
}
const other = buckets.get('other').map(p => p.name);
if (other.length) console.log('  OTHER: ' + other.join(', '));
