# 技能索引示例（SKILLS-INDEX）

> 这是**格式示例**，不是真实清单。照这个结构写你自己的。
> 真实生成用 [`tools/gen-skills-index.cjs`](../tools/gen-skills-index.cjs)。

---

# 我的技能索引

> **这份文件是给「我」（AI agent）自己看的技能目录。**
>
> 机制：索引（一行简介）→ 命中 → 读 `SKILL.md`（完整说明书）→ 按步骤执行。
> 规矩：见 system prompt 文件的「技能使用」节。

## 统计

| 项 | 数量 |
|---|---|
| 唯一技能总数 | **N** |
| 已自动归类 | N |
| 未归类 | 0 |

## 分类速查

| 分类 | 数量 | 什么时候用 |
|---|---|---|
| 📄 文档与办公 | 12 | Word / Excel / PPT / PDF / 飞书文档表格 |
| 🎬 图像 / 视频 / 音频 | 8 | 生图、改图、视频剪辑、配音 |
| 💻 开发与代码 | 20 | 写代码、审查、重构、测试 |
| 🔍 搜索与研究 | 6 | 查资料、搜索、学术调研 |
| 📊 电商 / 营销 / 商业 | 5 | 运营、广告投放、选品、营销方案 |
| 🤖 AI / Agent 构建 | 4 | 造 agent、蒸馏人设、多智能体协作 |

---

## ⚠️ 使用规则（我每次开工前照这个走）

1. 收到任务 → **先扫本文件或 `<available_skills>`**，判断有没有现成技能；
2. 有匹配 → **读完整 `SKILL.md`**，按里面步骤执行，禁止凭印象瞎做；
3. 无匹配 → 才用通用能力，并告诉用户「没有对应技能，按通用方式处理」；
4. **只读命中项**，不要把几百个技能全读一遍；
5. 用户点名技能 → 直接读那个，跳过索引；
6. 执行完按说明书「输出规范」交付，并说明验证结果。

---

## 📄 文档与办公（示例，12）

| 技能名 | 用途 |
|---|---|
| `docx` | Word 文档创建、读取、编辑、格式保留 |
| `xlsx` | Excel 工作簿读写、公式计算、数据分析 |
| `pptx` | PowerPoint 演示文稿创建与编辑 |
| `pdf` | PDF 读取、创建、合并拆分、表单填写 |
| `cli-anything-wps` | 本地 WPS Office 操控（Word/Excel/PPT 三合一） |
| `lark-doc` | 飞书云文档（Docx / Wiki）读取编辑 |
| `lark-sheets` | 飞书电子表格：建表、读写、图表、透视表 |
| `lark-base` | 飞书多维表格：台账、项目、订单系统 |
| `lark-drive` | 飞书云空间：上传下载、移动复制、权限 |
| `lark-wiki` | 飞书知识库：空间、节点、文档组织 |
| `office-render` | 文档渲染成图片，检查排版 |
| `office-export-pdf` | 任意 Office 文档转 PDF |

---

## 🎬 图像 / 视频 / 音频（示例，8）

| 技能名 | 用途 |
|---|---|
| `generate_image` | 文生图（Gemini / OpenAI / Seedream 等） |
| `edit_image` | 改图、合成、换风格 |
| `byted-mediakit-image` | 图片处理：压缩、裁剪、格式转换、元信息 |
| `byted-mediakit-video` | 视频处理：转码、抽帧、字幕、画质 |
| `byted-mediakit-audio` | 音频处理：语音定位、转码、人声分离 |
| `capcut-mate-skill` | 剪映：模板能力、功能说明 |
| `tts` | 文字转语音 |
| `p5js` | p5.js 生成艺术、着色器、交互 |

---

## 💻 开发与代码（示例，20）

| 技能名 | 用途 |
|---|---|
| `code-review-and-quality` | 代码审查：正确性、可维护性、性能 |
| `code-simplification` | 代码简化：去冗余、降复杂度 |
| `ponytail` | 逼出「最短能用」方案：能用标准库就别写 |
| `code-doc-generator` | 从代码生成文档 |
| `ci-cd-and-automation` | CI/CD 流水线搭建 |
| `api-and-interface-design` | API / 接口设计 |
| `backend-architect` | 后端架构设计 |
| `frontend-architect` | 前端架构设计 |
| `browser-testing-with-devtools` | 用 CDP 做浏览器测试 |
| `diagnose-windows-sandbox-acl` | Windows 沙箱 ACL 报错诊断 |
| `red-green-tdd` | 红绿测试纪律 |
| `delivery-review` | 交付前对抗式自审 |
| … | （其余按实际补） |

---

## 🔍 搜索与研究（示例，6）

| 技能名 | 用途 |
|---|---|
| `web_search` | 网络搜索，返回摘要 + 来源 URL |
| `web_fetch` | 抓指定 URL 内容转文本 |
| `deep-research` | 深度调研：多轮检索 + 证据分级 |
| `academic-researcher` | 学术文献调研：方向摸底、检索 |
| `competitorsmart` | 竞品分析 |
| `baoyu-url-to-markdown` | URL 转 markdown（走 CDP） |

---

## 分类命名建议

**用「领域 + emoji」组合**，好处是扫一眼就知道大概：

```
📄 文档与办公      🎬 图像/视频/音频    💻 开发与代码
🔍 搜索与研究      📊 电商/营销         🤖 AI/Agent 构建
🌐 浏览器与自动化  🧠 知识/记忆         📝 写作与内容
👤 人物视角/思维   🔧 系统/工具         📈 数据分析
🏢 企业/法律/工商  ✈️ 旅行/生活         📰 资讯/阅读
🎮 游戏开发        📱 移动端
```

**每类 5~50 个**：太多了继续拆，太少了合并到邻近类。

---

## 写索引的三个纪律

1. **每项只写一句话**（20~120 字），步骤留给 `SKILL.md`
2. **描述用「用户会怎么说」**，不用功能名
3. **新增能力必须同步加一行** —— 最容易被忘的一步
