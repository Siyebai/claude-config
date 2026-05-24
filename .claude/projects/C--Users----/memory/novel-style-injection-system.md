---
name: novel-style-injection-system
description: 小说风格注入系统 v1.0 — 大师风格解剖 + 场景拆解库 + 可执行指令注入 + 工具链集成
metadata:
  node_type: memory
  type: reference
  tier: SUPREME
  originSessionId: 2026-05-23
  depends_on: novel-supreme-engine, novel-craft-master-synthesis, pre-writing-sop
---

# 小说风格注入系统 v1.0

> 从"写出来可以过关"到"写出来有风格"的关键升级。
> 核心贡献: 把文学批评中的"余华的文字很冷"翻译为 Scribe 能执行的 5 条精准指令 + 8 条禁止规则 + 量化参数目标。

---

## 一、系统架构

```
大师风格档案 (9位作家 × 完整参数化)
    │
    ├→ style-modes CLI ──→ novel mode <cmd>    # 风格模式管理
    │
    ├→ 场景拆解库 (12场景 × 逐句技法标注)        # 人工学习材料
    │
    ├→ style-checker lint + 风格模式规则         # 自动化检测
    │
    ├→ pre-writing-sop Phase B0                 # 写前风格锚定
    │
    └→ novel-supreme-engine v4.0                # 引擎总纲
```

### 工具链位置

```
~/novels/tools/style-modes/
├── index.js                      # 引擎 CLI (7个命令)
├── masters/
│   ├── yu-hua.json               # 余华: 零度叙事·冷酷写实
│   ├── zhang-ailing.json         # 张爱玲: 华丽苍凉·感官通感
│   ├── wang-xiaobo.json          # 王小波: 黑色幽默·逻辑荒诞
│   ├── jin-yong.json             # 金庸: 古典叙事·侠义留白
│   ├── liu-cixin.json            # 刘慈欣: 宇宙尺度·冷静崇高
│   ├── mo-yan.json               # 莫言: 幻觉写实·感官轰炸
│   ├── shen-congwen.json         # 沈从文: 田园抒情·淡远自然
│   ├── lao-she.json              # 老舍: 京味口语·悲喜交织
│   └── wang-zengqi.json          # 汪曾祺: 散文化小说·平淡致远
└── scenes/
    ├── INDEX.md                   # 场景拆解库索引
    ├── yu-hua-bury-youqing.md     # 余华: 福贵埋葬有庆
    ├── zhang-ailing-liusu-room.md # 张爱玲: 白流苏在房间
    ├── wang-xiaobo-golden-age.md  # 王小波: 黄金时代开端
    └── lao-she-xiangzi-buys-car.md # 老舍: 祥子买车
```

---

## 二、9 位大师风格速查

| ID | 作家 | 标签 | 一句定位 | 核心参数 |
|----|------|------|---------|---------|
| yu-hua | 余华 | 零度叙事·冷酷写实 | 用最冷的句子写最痛的事 | 句长10-18字/对话30-40%/心描0%/比喻0-2‰/视觉+动作/叙事极远 |
| zhang-ailing | 张爱玲 | 华丽苍凉·感官通感 | 把感情写成物体，把颜色写成声音 | 句长18-30字/对话50-65%/心描30%/比喻8-15‰/视觉+触觉+嗅觉/叙事极近 |
| wang-xiaobo | 王小波 | 黑色幽默·逻辑荒诞 | 用严肃的逻辑推演荒谬的结论 | 句长15-25字/对话20-30%/思辨35%/比喻3-6‰/听觉+思辨/叙事近 |
| jin-yong | 金庸 | 古典叙事·侠义留白 | 古典小说的节奏讲现代故事 | 句长12-22字/对话40-55%/心描15%/比喻3-6‰/视觉+动作/叙事中 |
| liu-cixin | 刘慈欣 | 宇宙尺度·冷静崇高 | 用物理学的方式写小说 | 句长12-20字/对话25-35%/心描10%/比喻3-7‰/视觉+宇宙/叙事极远 |
| mo-yan | 莫言 | 幻觉写实·感官轰炸 | 最脏的字写最神圣的东西 | 句长15-28字/对话30-45%/心描20%/比喻10-20‰/五感全开/叙事可变 |
| shen-congwen | 沈从文 | 田园抒情·淡远自然 | 最淡的水墨写出最深的情感 | 句长15-22字/对话35-50%/心描15%/比喻2-5‰/视觉+听觉/叙事中远 |
| lao-she | 老舍 | 京味口语·悲喜交织 | 笑声和眼泪在同一个句子里 | 句长12-20字/对话50-65%/心描10%/比喻2-4‰/听觉+视觉/叙事中 |
| wang-zengqi | 汪曾祺 | 散文化小说·平淡致远 | 用写散文的方式写小说 | 句长10-20字/对话40-55%/心描5%/比喻1-3‰/味觉+视觉/叙事中近 |

---

## 三、每个大师档案的结构

每个 JSON 档案包含 10 个维度的完整参数化数据:

1. **parameters.sentence** — 句长分布 (avg/max/distribution/pattern/note)
2. **parameters.dialogue** — 对话风格 (ratio/style/speech_tags/note)
3. **parameters.psychology** — 心理描写策略 (ratio/method/note)
4. **parameters.metaphor** — 比喻系统 (density/type/note)
5. **parameters.sensory** — 感官配比 (ratios for 5 senses + special dimensions)
6. **parameters.narrative_distance** — 叙事距离 (level/description/note)
7. **parameters.paragraph** — 段落节奏 (avg_length/pattern/note)
8. **parameters.emotion_expression** — 情感表达方式 (method/rules/note)
9. **parameters.rhythm** — 核心节奏策略 (primary_device/description)
10. **additional unique dimension** — 每位大师独有的维度 (e.g. 余华的重复结构/张爱玲的物质细节/刘慈欣的尺度对比/老舍的北京声音...)

外加:
- **executable_instructions** (5条) — Scribe 可直接执行的写作指令，每条带 id/rule/instruction/check/severity
- **forbidden_patterns** (6-8条) — 正则匹配的禁止模式，每条带 pattern/reason
- **scene_preferences** (4类场景权重+指令)
- **rhythm_profile** (开篇/结尾/过渡策略)
- **voice_signature** (叙述者声音/距离/语气/词汇层级)
- **best_scenes_for_study** (3个推荐学习场景)

---

## 四、CLI 命令

```
novel mode list                     # 列出全部 9 位大师
novel mode load <id>                # 加载完整风格档案 (JSON)
novel mode apply <id> <file>        # 对章节应用风格检测 → 违规清单
novel mode compare <id> <file>      # 对比目标风格 vs 实际文本 → 参数匹配度
novel mode blend <a> <b> [ratio]    # 融合两种风格 → 混合模式
novel mode generate <id>            # 生成 Scribe 可执行写作指令 (Markdown)
novel mode inject <id> <file>       # 注入风格约束到章节 → 门禁配置 JSON
```

### 典型使用流

```bash
# 1. 确定风格模式
novel mode list                     # 浏览可选风格

# 2. 生成写作指令给 Scribe
novel mode generate yu-hua          # → 输出 Markdown 指令清单

# 3. 写完章节后检测
novel mode apply yu-hua chapter_001.md   # → 违规清单

# 4. 查看风格匹配度
novel mode compare yu-hua chapter_001.md # → 参数对比 + 对齐度

# 5. 如果需要一个独特的混合风格
novel mode blend yu-hua zhang-ailing 0.8 # → 80%余华 + 20%张爱玲

# 6. 注入门禁配置
novel mode inject yu-hua chapter_001.md  # → 约束 JSON → 写入 05_quality/chapter_gates/
```

---

## 五、风格模式混合策略

混合模式用于创造独特的个人风格。使用 `novel mode blend` 命令:

| 基座 (70-80%) | 修饰 (20-30%) | 效果 |
|---------------|---------------|------|
| 余华 | 张爱玲 | 冷的句子 + 偶尔的感官惊艳。句短但不干，有物质质感 |
| 老舍 | 王小波 | 京味幽默 + 逻辑思辨。底层视角 + 哲学深度 |
| 金庸 | 刘慈欣 | 古典叙事 + 宇宙尺度。武侠世界的文明级升级 |
| 沈从文 | 莫言 | 淡远抒情 + 偶尔的感官轰炸。牧歌中有血有肉 |
| 汪曾祺 | 张爱玲 | 平淡叙事 + 跨感官通感。散文化中有华丽 |
| 余华 | 老舍 | 冷的叙事 + 京味对话。残酷中有幽默 |
| 刘慈欣 | 莫言 | 硬科幻 + 感官洪流。宇宙尺度也有血肉 |

**混合原则:**
- 基座决定叙事距离、句长、心理描写策略
- 修饰决定比喻密度、感官配比、对话风格
- 禁止规则取并集（两套规则的禁止模式都生效）
- 不融合本质冲突的风格（e.g. 余华+莫言 = 冷+热 = 风格混乱）

---

## 六、与现有系统的集成

### style-checker lint 集成
- `novel style lint` 的 existence 规则可以在风格模式下调整阈值
- 余华模式: 情绪词阈值=0(零容忍)，比喻密度max=2
- 莫言模式: 比喻密度min=10(不能太低)，五感覆盖要求≥4种
- 未来: `novel style lint --mode yu-hua` 自动加载模式规则

### pre-writing-sop 集成
- Phase B0: 风格模式选择 (新增)
- Phase B1: 风格金样本 + 风格模式指令重读
- Phase F: 写作授权记录增加 style_mode 字段

### deslop-scanner 集成
- 不同风格模式有不同的 AI 词容忍度
- 余华模式: 情绪词=AI味(严格禁止)
- 张爱玲模式: 某些修饰副词可以适当容忍

---

## 七、场景拆解库

4个已完成拆解+8个待拆解。每个拆解包含:
- 逐句原文→技法→功能 三层标注
- 全局技法模式提取（6项可复用技法）
- 反向验证（错误示范+违规标注）

索引: `~/novels/tools/style-modes/scenes/INDEX.md`

---

## 八、下一步

- [ ] 完成剩余 8 个场景拆解
- [ ] style-checker lint 增加 `--mode <id>` 参数，自动加载模式规则
- [ ] deslop-scanner 增加模式感知阈值
- [ ] 实战验证: 选择一个风格模式，用完整工具链写一章
- [ ] 风格调音台: UI 界面，滑块调整风格参数，实时预览约束规则
- [ ] 自动风格检测: 输入一段文本 → 自动判断最接近哪位大师的风格
