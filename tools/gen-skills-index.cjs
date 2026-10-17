/**
 * 生成 DSH 技能中文索引
 * 输入: %TEMP%\skills-inventory.json（dump-skills.cjs 产出）
 * 输出: ~/.dsh/SKILLS-INDEX.zh.md
 */
const fs = require('fs');
const path = require('path');

const HOME = process.env.USERPROFILE;
const inv = JSON.parse(fs.readFileSync(path.join(process.env.TEMP, 'skills-inventory.json'), 'utf8'));

// 分类规则：按 name+desc 命中的关键词打分
const CATEGORIES = [
  {
    key: 'web-design',
    title: '🎨 网页与视觉设计',
    hint: '做网站、落地页、设计系统、动画、3D、WebGL',
    kw: ['webgl', 'threejs', 'three.js', 'gsap', 'css', 'tailwind', 'animation', 'layout', 'design',
      'landing', 'hero', 'shader', 'scroll', 'ui', 'typography', 'shadow', 'gradient', 'glass',
      'particle', 'mesh', 'canvas', 'svg', 'dither', 'blur', 'marquee', 'reveal', 'orbit', 'globe',
      'logo', 'brand', 'palette', 'figma', 'stitch', 'awwwards', 'slop', 'wireframe', 'excalidraw',
      'architecture-diagram', 'infographic', 'p5js', 'cobe', 'vanta', 'matterjs', 'lottie',
      'atmosphere', 'background', 'corner', 'laser', 'number-details', 'solar', 'icon', 'duotone',
      'texture', 'noise', 'grain', 'overlay', 'sticky', 'frame', 'led', 'glow', 'neon', 'retro',
      'brutalist', 'editorial', 'minimal', 'skeuomorphic', 'portfolio', 'pricing', 'landing-page'],
  },
  {
    key: 'office',
    title: '📄 文档与办公',
    hint: 'Word / Excel / PPT / PDF / WPS / 飞书文档表格',
    kw: ['docx', 'xlsx', 'pptx', 'pdf', 'word', 'excel', 'powerpoint', 'office', 'wps', 'slide',
      'spreadsheet', 'document', 'markdown', '飞书', 'lark-', 'base', 'sheets', 'drive', 'doc',
      'recalculate', 'export-pdf', 'render'],
  },
  {
    key: 'browser',
    title: '🌐 浏览器与桌面自动化',
    hint: '打开网页、点击填表、截屏、操作桌面、CDP',
    kw: ['browser', 'automation', 'computer-use', 'computer control', 'cdp', 'devtools', 'playwright',
      'puppeteer', 'selenium', 'desktop', 'gui', 'autocli', 'agent browser', 'scrape', 'crawl',
      'web-fetch', 'web_fetch', 'screenshot'],
  },
  {
    key: 'research',
    title: '🔍 搜索与研究',
    hint: '查资料、搜索、学术调研、竞品分析',
    kw: ['search', 'research', 'investigate', 'academic', 'paper', 'literature', 'survey',
      'competitor', 'deep-research', 'explore', 'find-', 'discover', 'url-to', 'readability'],
  },
  {
    key: 'code',
    title: '💻 开发与代码',
    hint: '写代码、审查、重构、测试、CI/CD、API 设计',
    kw: ['code', 'coding', 'git', 'test', 'review', 'refactor', 'debug', 'api', 'backend', 'frontend',
      'database', 'sql', 'ci-cd', 'debugging', 'typescript', 'python', 'rust', 'docker', 'devops',
      'architect', 'engineer', 'simplification', 'doc-generator', 'tdd', 'ponytail', 'context-engineering',
      'dsh-plugin', 'make-dsh', 'skill-creator', 'plugin'],
  },
  {
    key: 'mobile',
    title: '📱 移动端与跨端',
    hint: 'Android / iOS / 小程序 / 桌面应用',
    kw: ['android', 'ios', 'mobile', 'flutter', 'react-native', 'swift', 'kotlin', 'tauri',
      'electron', 'desktop-app', 'app-builder', '移动端'],
  },
  {
    key: 'media',
    title: '🎬 图像 / 视频 / 音频',
    hint: '生图、改图、视频剪辑、配音、TTS',
    kw: ['image', 'video', 'audio', 'tts', 'voice', 'music', 'seedream', 'seedance', 'midi',
      'capcut', 'ffmpeg', 'transcri', 'ocr', 'photo', 'picture', 'render', 'brandkit',
      'imagegen', 'image-to-code', 'edit_image', 'generate_image'],
  },
  {
    key: 'business',
    title: '📊 电商 / 营销 / 商业',
    hint: 'Amazon 运营、广告投放、选品、营销方案、财务',
    kw: ['amazon', 'ecommerce', 'e-commerce', 'marketing', 'advertising', 'ads', 'campaign',
      'listing', 'keyword', 'product-selection', 'sales', 'finance', 'stock', 'investment',
      'business', 'pricing', 'cro', 'seo', 'conversion', 'brand-strategy', 'competitorsmart',
      '跨境', '选品'],
  },
  {
    key: 'knowledge',
    title: '🧠 知识 / 记忆 / 学习',
    hint: '知识库、笔记、Obsidian、记忆、专家库',
    kw: ['wiki', 'knowledge', 'obsidian', 'memory', 'note', 'learn', 'expert', 'skill-review',
      'llm-wiki', 'kb-', 'second-brain', 'flashcard', 'study'],
  },
  {
    key: 'writing',
    title: '📝 写作与内容',
    hint: '文案、脚本、公众号、小说、报告、翻译',
    kw: ['writ', 'copy', 'content', 'script', 'novel', 'story', 'article', 'blog', 'newsletter',
      'translat', 'rewrite', 'summar', 'report', 'draft', '文案', '写作', '口播'],
  },
  {
    key: 'persona',
    title: '👤 人物视角 / 思维模型',
    hint: '用某位大师的思维方式分析问题',
    kw: ['perspective', 'munger', 'karpathy', 'persona', 'advisor', 'mentor', 'thinking',
      'mental-model', 'advisor', '专家'],
  },
  {
    key: 'system',
    title: '🔧 系统 / 工具 / 环境',
    hint: 'Windows 操作、沙箱、包管理、备份、定时任务',
    kw: ['windows', 'powershell', 'sandbox', 'acl', 'install', 'backup', 'cloud-upload', 'cron',
      'schedule', 'shortcut', 'cli', 'bdpan', 'storage', 'env', 'setup', 'config', 'diagnose'],
  },
  {
    key: 'data',
    title: '📈 数据分析与可视化',
    hint: '数据分析、图表、报表、BI',
    kw: ['data-analysis', 'analytics', 'visualiz', 'chart', 'dashboard', 'metric', 'statistic',
      'table', 'pivot'],
  },
  {
    key: 'enterprise',
    title: '🏢 企业 / 法律 / 工商查询',
    hint: '企查查类背调、合同审查、法律检索、尽调',
    kw: ['qcc', 'qibook', 'yuandian', '企查查', '企百科', '元典', '工商', '股权', '尽调', '背调',
      'contract', 'legal', 'law', '合规', 'contract-review', 'esign', '电子签', '法条', '法规',
      '诉讼', '判决', 'patent', '专利', 'tax', '税务', 'qc', '创业', 'chuangye', 'gtm',
      'business-model', 'sales', '职业经理人'],
  },
  {
    key: 'travel',
    title: '✈️ 旅行 / 生活服务',
    hint: '订酒店机票、行程规划、地图、点餐',
    kw: ['travel', 'trip', 'hotel', 'flight', '携程', '同程', '美团', 'meituan', 'ctrip', 'trip.com',
      '地图', 'map', '导航', 'route', '行程', '机票', '火车票', '门票', '攻略', '酒店', 'mcd',
      '麦当劳', '点餐', '外卖'],
  },
  {
    key: 'news',
    title: '📰 资讯 / 内容 / 阅读',
    hint: '新闻搜索、公众号、读书、文风分析',
    kw: ['news', '新闻', '资讯', '头条', '热点', 'weather', '天气', 'weread', '微信读书', '阅读',
      '书评', '笔记划线', 'wechat', '公众号', '文风', 'style-profiler', '投递', '订阅'],
  },
  {
    key: 'game',
    title: '🎮 游戏开发',
    hint: '游戏地图、角色、数值、引擎、渲染',
    kw: ['game', '游戏', 'unity', 'unreal', 'godot', 'skyline', '渲染引擎', 'shader', '关卡',
      '角色设计', '数值设计', '地图编辑'],
  },
  {
    key: 'agentbuild',
    title: '🤖 AI / Agent 构建',
    hint: '造 agent、蒸馏人设、多智能体协作、技能评测',
    kw: ['agent', 'persona', '人设', '蒸馏', '女娲', 'nuwa', 'another_them', 'skill-creator',
      '造skill', 'a2a', 'bridge', '多智能体', '协作', 'eval', '评测', 'skill 校验', 'wxa-skills'],
  },
];

function score(desc, kws) {
  const t = desc.toLowerCase();
  let s = 0;
  for (const k of kws) if (t.includes(k.toLowerCase())) s++;
  return s;
}

// 描述为空时从 SKILL.md 正文里捞第一句有意义的话
function fallbackDesc(s) {
  try {
    const p = path.join(HOME, s.path);
    const t = fs.readFileSync(p, 'utf8');
    const body = t.replace(/^---[\s\S]*?---/, '').trim();
    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const l of lines) {
      if (l.startsWith('#')) continue;
      if (l.startsWith('|')) continue;
      if (l.length > 8) return l.replace(/^[-*>]\s*/, '').slice(0, 140);
    }
  } catch (_) {}
  return '';
}

// 路径兜底分类（仅用于极少数明确无歧义的场景，别滥用）
function pathCategory(s) {
  return null; // 注意：不要按 expert-library 目录强归类 —— 那目录里有 217 个技能，内容五花八门
}

// 人工兜底：剩下的边角料
const OVERRIDES = {
  '25-个人知识库架构师': { cat: 'knowledge', desc: '个人知识库架构设计专家角色（来自 skillsbot.cn 的专家库）' },
  'creative-ideation': { cat: 'writing', desc: '用创意约束批量生成项目点子 / 头脑风暴' },
  'jianying': { cat: 'media', desc: '剪映（CapCut）创作工具：模板能力、功能说明、帮助文档整理' },
  'shipping-and-launch': { cat: 'code', desc: '生产发布前的检查清单：部署上线要确认哪些项' },
};

// 每个技能归到最高分的类，0 分进「其他」
const buckets = new Map();
for (const c of CATEGORIES) buckets.set(c.key, []);
const other = [];

for (const s of inv) {
  if (!s.desc || !s.desc.trim()) s.desc = fallbackDesc(s);

  const ov = OVERRIDES[s.name];
  if (ov) {
    if (ov.desc) s.desc = ov.desc;
    if (buckets.has(ov.cat)) { buckets.get(ov.cat).push(s); continue; }
  }

  const forced = pathCategory(s);
  if (forced && buckets.has(forced)) { buckets.get(forced).push(s); continue; }

  const hay = (s.name + ' ' + s.desc).toLowerCase();
  let best = null, bestScore = 0;
  for (const c of CATEGORIES) {
    const sc = score(hay, c.kw);
    if (sc > bestScore) { bestScore = sc; best = c; }
  }
  if (best && bestScore > 0) buckets.get(best.key).push(s);
  else other.push(s);
}

const now = new Date();
const ymd = now.toISOString().slice(0, 10);

let out = '';
out += '---\n';
out += 'type: note\n';
out += 'tags: [技能索引, DSH, agent]\n';
out += 'status: promoted\n';
out += 'updated: ' + ymd + '\n';
out += '---\n\n';
out += '# DSH 技能索引（中文分门别类版）\n\n';
out += '> **这份文件是给「我」（DSH agent）自己看的技能目录。**\n';
out += '>\n';
out += '> DSH 的机制是「索引 + 说明书」两段式：\n';
out += '>\n';
out += '> | 机制 | DSH 对应物 |\n';
out += '> |---|---|\n';
out += '> | 技能目录（一行简介） | system prompt 自动注入的 `<available_skills>` + 本文件 |\n';
out += '> | 完整说明书 | `~/.dsh/skills/<name>/SKILL.md`、`~/.agents/skills/<name>/SKILL.md` |\n';
out += '> | 读说明书的动作 | `skill({name})` 工具 |\n';
out += '> | 常驻规则（system prompt） | `~/.dsh/AGENTS.md` |\n\n';
out += '> **为什么还要这份文件**：`<available_skills>` 是英文平铺列表，中文触发词匹配不上；\n';
out += '> 本文件按中文用途分类，回答「我有哪些能力」和「用户这么说该用哪个技能」更快。\n\n';
out += '---\n\n';
out += '## 统计\n\n';
out += '| 项 | 数量 |\n|---|---|\n';
out += '| 唯一技能总数 | **' + inv.length + '** |\n';
out += '| 已自动归类 | ' + (inv.length - other.length) + ' |\n';
out += '| 未归类 | ' + other.length + ' |\n\n';
out += '## 分类速查\n\n';
out += '| 分类 | 数量 | 什么时候用 |\n|---|---|---|\n';
for (const c of CATEGORIES) {
  const n = buckets.get(c.key).length;
  if (!n) continue;
  out += '| ' + c.title + ' | ' + n + ' | ' + c.hint + ' |\n';
}
if (other.length) out += '| 📦 其他 | ' + other.length + ' | 见文末 |\n';
out += '\n---\n\n';

out += '## ⚠️ 使用规则（我每次开工前照这个走）\n\n';
out += '1. 收到任务 → **先扫本文件或 `<available_skills>`**，判断有没有现成技能；\n';
out += '2. 有匹配 → **调 `skill({name})` 读完整说明书**，按里面步骤执行，禁止凭印象瞎做；\n';
out += '3. 无匹配 → 才用通用能力，并告诉用户「没有对应技能，按通用方式处理」；\n';
out += '4. **只读命中项**，不要把 375 个技能全读一遍（烧 token 还跑偏）；\n';
out += '5. 用户点名技能（如「用 baoyu-infographic」）→ 直接读那个，跳过索引；\n';
out += '6. 执行完按说明书「输出规范」交付，并说明验证结果。\n\n';
out += '---\n\n';

for (const c of CATEGORIES) {
  const items = buckets.get(c.key).sort((a, b) => a.name.localeCompare(b.name));
  if (!items.length) continue;
  out += '## ' + c.title + '（' + items.length + '）\n\n';
  out += '| 技能名 | 用途 |\n|---|---|\n';
  for (const s of items) {
    const d = (s.desc || '').slice(0, 110).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
    out += '| `' + s.name + '` | ' + (d || '（描述为空）') + ' |\n';
  }
  out += '\n';
}

if (other.length) {
  out += '## 📦 其他未归类（' + other.length + '）\n\n';
  out += '| 技能名 | 用途 |\n|---|---|\n';
  for (const s of other.sort((a, b) => a.name.localeCompare(b.name))) {
    const d = (s.desc || '').slice(0, 110).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
    out += '| `' + s.name + '` | ' + (d || '（描述为空）') + ' |\n';
  }
  out += '\n';
}

out += '---\n\n';
out += '## 怎么写一个新技能（DSH 版说明书模板）\n\n';
out += 'DSH 的 SKILL.md 格式（frontmatter + 正文）：\n\n';
out += '```markdown\n';
out += '---\n';
out += 'name: 技能短名（英文小写，与文件夹同名）\n';
out += "description: 一句话说清「做什么 + 什么时候用」。DSH 靠这句做匹配，所以要写进用户可能说的原话关键词。\n";
out += '---\n\n';
out += '# 技能中文名\n\n';
out += '## 适用场景\n';
out += '- 触发词：…\n';
out += '- 典型需求：…\n';
out += '- 不适用：…（防止误用）\n\n';
out += '## 前置条件\n';
out += '- 依赖什么工具/环境，执行前怎么检查\n\n';
out += '## 使用步骤\n';
out += '1. …\n';
out += '2. …\n\n';
out += '## 输出规范\n';
out += '- 交付物格式 / 保存路径 / 命名规则\n\n';
out += '## 注意事项（坑）\n';
out += '- 常见报错与解法、易错点、安全边界\n';
out += '```\n\n';
out += '**放哪**：`~/.dsh/skills/<name>/SKILL.md`（用户级，所有会话可见）\n';
out += '**怎么生效**：放进去后重载会话即可（`<available_skills>` 是启动时扫描的）\n';

const dest = path.join(HOME, '.dsh', 'SKILLS-INDEX.zh.md');
fs.writeFileSync(dest, out, 'utf8');
console.log('WROTE ' + dest);
console.log('BYTES ' + Buffer.byteLength(out, 'utf8'));
console.log('CATEGORIZED ' + (inv.length - other.length) + ' / OTHER ' + other.length);
for (const c of CATEGORIES) {
  const n = buckets.get(c.key).length;
  if (n) console.log('  ' + c.title + '  ' + n);
}
