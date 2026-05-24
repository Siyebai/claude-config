---
name: character-voice-card-template
description: 角色语音卡模板 — 每个主要角色一张卡，Scribe 写对话时强制参照
metadata: 
  node_type: memory
  type: template
  tier: CORE
  integrats: Scribe Voice Distinction + novel-studio 4-writer specialization + character-management
  originSessionId: 127bcddb-b672-4c27-b772-ad337294a248
---

# 角色语音卡 (Character Voice Card)

> 每个主要角色一张卡。Scribe 写角色对话和内心独白时**必须**参照此卡。
> 目标：读者不看标签也能分辨是谁在说话。

---

## 一、语音指纹 (Voice Fingerprint)

```yaml
character_name: ""
role: ""                     # 主角 / 反派 / Ally / Mentor / Shadow / Foil / Shapeshifter / Love

# === 说话方式 ===
speech_profile:
  sentence_length: ""        # 短句(5-10字) / 中句(10-20) / 长句(20+)
                             # 例：老兵用短句，谋士用长句，小孩用碎句
  
  vocabulary_level: ""       # 简单 / 中等 / 雅致 / 专业
                             # 例：市井角色词汇简单粗粝，学院角色词汇雅致精确
  
  tone: ""                   # 基础语气: 直率/圆滑/嘲讽/温和/暴躁/幽默/阴沉/热情
  
  rhythm: ""                 # 说话节奏: 快而碎/稳而沉/慢而重/跳跃
  
  filler_words: []           # 口头禅/惯用填充词
                             # 例："说真的" "你懂吗" "嗯…" "嘿嘿" "切"
  
  signature_pattern: ""      # 最标志性的说话模式
                             # 例："总把陈述说成反问" / "每句话结尾往下坠" / "喜欢用军事比喻"

# === 不可说的话 (CRITICAL) ===
forbidden_speech:
  words_never_use: []        # 这个角色绝对不会说的词
                             # 例：书生不会说脏话，武将不会说"大抵""罢了"
  
  patterns_never_use: []     # 这个角色绝对不会用的表达
                             # 例：冷血杀手不会说"我好伤心"，学者不会说"牛逼"
  
  topics_avoid: []           # 这个角色回避的话题
  
  tell_instead_of_show: []   # 这个角色最容易"告诉而不是呈现"的情感
                             # → Scribe 必须用身体反应替代
```

---

## 二、内心独白风格 (Internal Monologue)

```yaml
internal_voice:
  thought_pattern: ""        # 思考方式
                             # 例："用问题推演(如果…那么…)" / "画面式回忆" / "直觉感受"
  
  self_awareness: ""         # 自我觉察度: 高(能反思自己)/中/低(不自知)
  
  cognitive_bias: ""         # 认知偏误 — 这个角色怎么误解世界
                             # 例："认为所有人都在针对他" / "过度乐观，无视危险"
  
  emotional_vocabulary: ""   # 内心感受的词汇范围
                             # 例：粗人只有"高兴/生气/难过"，诗人有"怅然/缱绻/萧索"
```

---

## 三、对话中的角色间关系 (Per-Relationship Voice Shift)

```yaml
# 角色对不同人说话的方式不同
voice_shift:
  to_superiors: ""           # 对上级/长辈: 恭敬短促 / 故作轻松 / 沉默寡言
  to_inferiors: ""           # 对下级/晚辈: 命令式 / 温和耐心 / 不屑
  to_equals: ""              # 对平级/朋友: 放松自然 / 竞争性 / 调侃
  to_love_interest: ""       # 对爱慕对象: 结巴紧张 / 故意冷淡 / 话突然变多
  to_enemy: ""               # 对敌人: 冰冷礼貌 / 挑衅 / 沉默
```

---

## 四、非语言交流 (Non-Verbal Communication)

```yaml
body_language:
  nervous_tell: ""           # 紧张时的身体信号: 捏手指/咬唇/摸后颈/抖腿
  anger_tell: ""             # 愤怒时: 下颌收紧/沉默/反而微笑/握拳
  lying_tell: ""             # 说谎时: 避开目光/过度凝视/摸鼻子
  affection_tell: ""         # 表达好感时: 靠近/触碰/分享食物/别扭地关心
  default_posture: ""        # 默认姿态: 挺拔/佝偻/放松/紧绷

gesture_library:             # 常用动作词典
  - gesture: ""              # 动作描述
    meaning: ""              # 代表什么情绪/意图
    frequency: ""            # 高频/中频/低频 (防止动作重复使用)
```

---

## 五、角色话语风格学习样本 (Voice Sample)

```markdown
## 金句样本 (100字)

> [在此写入一段这个角色的典型对话或内心独白，100字左右。
>  这段样本应该让 Scribe 一眼就能抓住这个角色的声音特质。]
```

---

## 六、写法模式绑定 (Writer Mode Binding)

```yaml
# 整合自 novel-studio-copilot-cli 的四类写手分工
# 不同类型场景中，这个角色的声音如何变化

writer_mode:
  action_scenes:             # 动作场景中的语言特征
    sentence_style: ""       # 更短/更碎/更直接
    typical_line: ""         # 举一句典型的动作场景台词
    
  emotional_scenes:          # 情感场景中的语言特征
    sentence_style: ""       # 可能更碎/更沉默/或反而滔滔不绝
    typical_line: ""
    
  dialogue_heavy_scenes:     # 对话密集场景中的语言特征
    sentence_style: ""
    typical_line: ""
    
  internal_reflection:       # 内心反思时的语言特征
    sentence_style: ""
    typical_line: ""
```

---

> **用法**: Phase 2 角色引擎完成后，为每个主要角色（主角+反派+4-5个功能位配角）各建一张语音卡。
> Scribe 写对话前: 打开所有出场角色的语音卡 → 对比角色间语音差异 → 确保每句对话符合该角色的语音指纹。
> **关键规则**: 如果两个角色的语音卡可以互换而不违和 → 语音卡写得不够差异化，重写。
