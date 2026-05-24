---
name: style-profile-template
description: "小说风格档案模板 — 写前锚定风格，全书锁定。替代\"事后审查\"为\"写前约束\""
metadata: 
  node_type: memory
  type: template
  tier: CORE
  integrats: Style Curator 4维度 + autonovel prose评估 + AI-Novel-Assistant写法引擎 + novel-writer constitution
  originSessionId: 127bcddb-b672-4c27-b772-ad337294a248
---

# 风格档案 (Style Profile)

> 本书的"写法宪法"。写作前锁定，全书不可随意更改。
> 每个 Scribe 在写作前**必须**加载此文件。

---

## 一、风格宪法 (Style Constitution)

```yaml
# 本书的最高风格原则 — 不可妥协
constitution:
  prime_directive: ""        # 一句话：这本书的写法追求什么？
                             # 例："冷峻克制，让事实说话" / "华丽绵密，感官铺陈" / "简洁有力，节奏如刀"
  
  non_negotiables:           # 绝对不可违反的规则
    - ""                     # 例："绝不直接说出角色情绪"
    - ""                     # 例："每场景至少三种感官"
    - ""                     # 例："对话标签只用'说'和'问'"
  
  forbidden_words:           # 本书禁用词清单
    ai_slop:                 # AI高频词
      - 目光 身形 冷笑 深深 不由得 似乎 仿佛 轻轻 微微 心中一惊 眼中闪过
      - 翻天覆地 不可思议 前所未有 毁天灭地 惊天动地
    weak_modifiers:          # 弱化副词
      - 很 非常 真的 特别 极其 无比 极其 稍微 颇
    cliches:                 # 本书禁止的陈词滥调
      - 心砰砰跳 时间仿佛静止 心中涌起一股
    project_specific:        # 本书特有的禁用词
      - []
```

---

## 二、四维风格参数 (Style Dimensions)

```yaml
prose_density:               # 散文密度
  level: "balanced"          # minimalist / balanced / lyrical
  avg_sentence_length: 18    # 目标平均句长 (极简12-15 / 均衡15-22 / 抒情20-30)
  description_density: "medium"  # low / medium / high
  white_space_usage: "moderate"  # sparse / moderate / generous

narrative_distance:          # 叙事距离
  level: "deep"              # remote / close / deep
  internal_monologue_ratio: 0.25  # 内心独白占比
  authorial_intrusion: false      # 允许作者评论吗
  filter_through_pov: true        # 是否通过POV角色过滤一切

rhythm:                      # 节奏模式
  primary: "varied"          # staccato / flowing / varied
  action_scenes: "staccato"  # 动作场景专用节奏
  reflection_scenes: "flowing"  # 反思场景专用节奏
  dialogue_scenes: "varied"     # 对话场景专用节奏

vocabulary_register:         # 词汇等级
  level: "moderate"          # simple / moderate / complex
  technical_terms: []        # 允许的专业术语列表
  period_vocabulary: false   # 是否使用时代限定词汇
  invented_terms: []         # 自创词汇清单
```

---

## 三、语言指纹 (Linguistic Fingerprint)

```yaml
sentence_patterns:           # 标志句式
  opening_style: ""          # 偏好如何开头句子
                             # 例："名词开头 (The door creaked.)" / "动作开头 (He ran.)"
  complex_sentence_ratio: 0.3  # 复合句比例
  fragment_usage: "sparingly"  # 句子碎片使用: never / sparingly / freely
  paragraph_structure: ""      # 典型段落结构
                             # 例："短开→中展→短收" / "长叙→对话打断→短句收尾"

metaphor_style:              # 比喻风格
  source_domain: ""          # 比喻取材领域
                             # 例："自然界" / "工业机械" / "人体" / "军事" / "烹饪"
  density: "moderate"        # 比喻密度: sparse / moderate / rich
  example: ""                # 一条典型的本书比喻

sensory_strategy:            # 感官策略
  primary_sense: "visual"    # 主导感官
  secondary_sense: "auditory"  # 次要感官
  senses_ratio:              # 目标五感比例
    visual: 0.40
    auditory: 0.25
    tactile: 0.20
    olfactory: 0.10
    gustatory: 0.05
```

---

## 四、对话规则 (Dialogue Rules)

```yaml
tag_policy: "minimal"        # 对话标签策略: minimal(仅说/问) / action_beats(动作代替) / moderate
subtext_priority: "high"     # 潜台词优先级: low(直白) / medium / high(言外之意)
speech_pattern_variation: "distinct"  # 角色语音区分度: similar / varied / distinct

dialogue_to_narration_ratio:  # 对话与叙述比例
  action_chapters: 0.50       # 快档章节对话占比
  development_chapters: 0.40  # 中档章节
  reflection_chapters: 0.60   # 慢档章节
```

---

## 五、题材适配 (Genre Adaptation)

```yaml
genre: ""                    # 题材: 玄幻/都市/悬疑/言情/科幻/历史/恐怖/文学
genre_conventions:           # 本题材的核心约定
  - ""
  - ""
style_references:            # 对标作品/作家风格
  - title: ""
    author: ""
    what_to_learn: ""        # 从这部作品学什么风格特质
  - title: ""
    author: ""
    what_to_learn: ""

target_reader_experience: "" # 读者阅读这本书时应该感受到的质感
                             # 例："像在深冬围炉听老人讲故事" / "像看一部高速剪辑的动作片"
```

---

## 六、风格金样本 (Style Anchor — 最关键)

```markdown
## 500字金样本

> 以下是一段代表本书理想风格的文字。它不是本书的内容，而是风格的标尺。
> Scribe 每次写作前必须阅读此样本，内化风格后再动笔。

[在此写入 500 字的风格金样本。这段文字应该：
 1. 展示本书的叙事腔调
 2. 展示典型的句子节奏
 3. 展示对话风格
 4. 展示感官描写方式
 5. 展示情感表达方式（show, not tell）
 6. 读完之后，读者能清晰感受到"这本书的质感"]
```

---

## 七、风格版本控制

```yaml
version: "1.0"
created: ""
last_modified: ""
change_log:
  - version: "1.0"
    date: ""
    change: "初始风格锚定"
```

---

> **用法**: 新书启动时，Architect Agent 在 Phase 0 完成本文件。全书锁定。如需修改，必须经过 Architect + Style Curator 联合评审，并在 change_log 中记录理由。
