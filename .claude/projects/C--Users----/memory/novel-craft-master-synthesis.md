---
name: novel-craft-master-synthesis
description: 小说写作技法大全 v1.0 — 15个开源项目的完整技法提取、分类、整合
metadata:
  node_type: memory
  type: reference
  tier: SUPREME
  originSessionId: 2026-05-23
  sources: 15 projects (Round 1-3)
---

# 小说写作技法大全 v1.0

> 15 个顶级开源项目的完整技法提取。每项技法标注来源、可执行化状态、整合目标。

---

## 一、写作前准备技法 (Pre-Writing)

### 1.1 创意锁定

| 技法 | 来源 | 状态 |
|------|------|------|
| **一句话种子公式**: "当[主角]遭遇[事件]，必须[行动]，否则[后果]；同时[更大危机]正在发酵" | AI_NovelGenerator | ❌ 仅在文档 |
| **逆推三锚点**: 终局画面→中点画面→开场画面 (从结局倒推) | novel-creator-skill | ✅ novel-cli 模板 |
| **欲望-障碍-代价三角**: Want/Obstacle/Cost/Need 四要素 | novel-creator-skill | ✅ novel-cli 模板 |
| **Clarify 5问**: POV欲望/具体障碍/情况变化/新信息/情感弧线 | novel-writer | ✅ pre-writing-sop Phase C |

### 1.2 宪法锁定

| 技法 | 来源 | 状态 |
|------|------|------|
| **风格宪法**: prime_directive + non_negotiables + forbidden_words | novel-writer + 自设计 | ✅ style-profile-template |
| **Spec-Kit流程**: Constitution→Specify→Clarify→Plan→Tasks→Write→Analyze | novel-writer | ✅ 方法论融合 |
| **门禁配置**: 每步→质量门→下一步 | novel-creator-skill | ✅ gate_config.json |

### 1.3 上下文加载

| 技法 | 来源 | 状态 |
|------|------|------|
| **距离衰减事实检索**: weight = base_score × log(1 + 1/distance) | WenShape | ✅ fabula-entropy |
| **角色状态五点追踪**: 物品/能力/身体&心理状态/关系网/触发事件 | AI_NovelGenerator | ❌ 需移植为模板 |
| **伏笔扫描**: 应回收/应新埋/未回收>已回收×1.5→优先回收 | novel-creator-skill | ✅ pre-writing-sop Phase A3 |
| **Token预算自适应**: 根据模型上下文窗口线性插值 | AI-Reader-V2 | ❌ 架构参考 |

---

## 二、情节与结构技法 (Plot & Structure)

### 2.1 宏观结构

| 技法 | 来源 | 状态 |
|------|------|------|
| **Save the Cat 15节拍**: Opening→Theme→Setup→Catalyst→Debate→B2→B Story→Fun→Midpoint→BadGuys→AllIsLost→DarkNight→B3→Finale→FinalImage | beat-calculator | ✅ beat-calculator |
| **雪花法10层**: 一句话→段落→角色→世界观→情节→逐章→正文 | AI_NovelGenerator | ❌ 需整合到beat-calculator |
| **三幕情节**: Act1触发(3铺垫+催化剂+错误选择)→Act2对抗(升级+虚假胜利+灵魂黑夜)→Act3解决(代价+嵌套转折+2悬念) | AI_NovelGenerator | ❌ 需整合 |
| **三档节奏配额**: fast:medium:slow = 2:5:3 + Anti-Rush(禁止连续快) | 自设计 | ✅ beat-calculator |

### 2.2 章级结构

| 技法 | 来源 | 状态 |
|------|------|------|
| **逐章蓝图元数据**: 标题/定位(角色|事件|主题)/作用(推进|转折|揭示)/悬念密度/伏笔操作/认知颠覆度/简述 | AI_NovelGenerator | ❌ 需整合 |
| **章节分块技术**: 长篇小说按max_tokens计算分块大小，避免超上下文 | AI_NovelGenerator | ❌ 架构参考 |
| **Scene & Sequel模式**: 场景(目标→冲突→灾难) + 续章(反应→困境→决定) | Dwight Swain 经典 | ❌ 无工具检测 |

### 2.3 伏笔与信息管理

| 技法 | 来源 | 状态 |
|------|------|------|
| **伏笔追踪**: ID/内容/埋设章/计划回收/状态/优先级 | novel-creator-skill | ✅ plot_threads.md |
| **叙事钩子追踪**: 自动检测未闭合的情节钩子 + 到期提醒 | PlotPilot | ❌ 需实现 |
| **信息释放节奏**: 悬疑/戏剧反讽/揭秘 三种模式切换 | — | ❌ 无工具 |

---

## 三、角色塑造技法 (Character)

### 3.1 角色设计

| 技法 | 来源 | 状态 |
|------|------|------|
| **驱动力三角**: Want(表层欲望)/Need(深层需求)/Flaw(缺陷)/Ghost(创伤) | novel-creator-skill | ✅ character_bible模板 |
| **角色弧线五阶段**: 初始状态→触发事件→认知失调→蜕变节点→最终状态 | AI_NovelGenerator | ❌ 需整合 |
| **功能位体系**: Protagonist/Antagonist/Ally/Mentor/Shadow/Foil/Shapeshifter/Love | novel-creator-skill | ✅ character_bible模板 |

### 3.2 角色语音

| 技法 | 来源 | 状态 |
|------|------|------|
| **语音指纹**: 句长/词汇等级/语气/节奏/口头禅/标志句式 | 自设计 | ✅ character-voice-card |
| **禁用词清单**: 绝不说/绝不用/回避话题 | 自设计 | ✅ character-voice-card |
| **关系语音切换**: 对上级/平级/下级/爱慕对象/敌人 各不同 | 自设计 | ✅ character-voice-card |
| **非语言交流库**: 紧张/愤怒/说谎/好感 身体信号 + 动作频率控制 | 自设计 | ✅ character-voice-card |

### 3.3 角色关系

| 技法 | 来源 | 状态 |
|------|------|------|
| **70+关系类型规范化**: 6类染色(family红/intimate粉/hierarchical金/social绿/hostile黑/other灰) | AI-Reader-V2 | ✅ knowledge-graph |
| **Union-Find别名消解**: 合并重叠别名组→规范名 + 安全过滤 | AI-Reader-V2 | ✅ knowledge-graph |
| **血缘关系锁定**: 直系血缘不可覆盖，冲突标记INCONSISTENCY | AI-Reader-V2 | ✅ knowledge-graph |
| **关系冲突网**: 价值冲突/合作纽带/隐藏背叛可能性 | AI_NovelGenerator | ❌ 需整合 |

---

## 四、文笔与风格技法 (Prose & Style)

### 4.1 句子工艺

| 技法 | 来源 | 状态 |
|------|------|------|
| **句长分布分析**: avg/median/p25/p75/std + 四档分布(短≤12/中13-25/长26-40/特长>40) | 自设计 + LongStoryEval | ✅ style-checker |
| **句式多样性**: 不仅是平均句长，还有标准差异、长短交替频率 | — | ❌ style-checker只做句长 |
| **Show vs Tell**: 判断句密度 / 情感直陈 vs 身体反应 / 抽象词占比 | — | ❌ 无检测 |
| **具体vs抽象词比**: 可感知词(颜色/声音/气味) vs 概念词(爱/恨/正义) | — | ❌ 无检测 |

### 4.2 修饰控制

| 技法 | 来源 | 状态 |
|------|------|------|
| **弱化副词检测**: 很/非常/真的/特别/极其... ≤3/千字 | text_humanizer.py | ✅ deslop-scanner |
| **"地"字副词检测**: ~地结构密度 | text_humanizer.py | ✅ style-checker |
| **Weasel词检测**: 207个英文弱化词(英文) → 中文等价物需构建 | write-good | ❌ 需移植 |
| **E-Prime**: 减少be-动词使用(英文)→中文等价:减少"是"字判断句 | write-good | ❌ 需移植 |
| **冗长短语替换**: 218个(英文)→中文等价:"利用"→"用","进行"→(删) | write-good | ❌ 需构建 |

### 4.3 修辞手法

| 技法 | 来源 | 状态 |
|------|------|------|
| **8种修辞检测**: 比喻/比拟/反复/排比/对偶/通感/引用 | CLGC 数据集 | ❌ 无检测 |
| **比喻风格分析**: 取材域 + 密度 + 金句锚定 | 自设计 | ✅ style-checker部分 |
| **三联排比检测**: "...，...，..." 并列句式 ≤2次/章 | text_humanizer.py | ✅ deslop-scanner |

### 4.4 感官描写

| 技法 | 来源 | 状态 |
|------|------|------|
| **五感配比**: 视觉40%/听觉25%/触觉20%/嗅觉10%/味觉5% | 自设计 | ✅ style-checker |
| **非常规感官组合**: "听见阳光的重量" 式通感 | AI_NovelGenerator | ❌ 无检测 |

### 4.5 AI味检测 (7类86短语)

| 技法 | 来源 | 状态 |
|------|------|------|
| AI高频词 / 弱化副词 / 重要性膨胀 / 结论陈词 / 段首总结 / 正式侵入 / 三联排比 | text_humanizer.py | ✅ deslop-scanner 完整移植 |

---

## 五、场景工艺技法 (Scene Craft)

### 5.1 四类场景写作指令 (← AI_NovelGenerator)

**对话场景:**
- 潜台词冲突 — 角色说的≠角色想的
- 不对称对话长度反映权力关系
- 对话即行动 — 每句话推动剧情/揭示角色/制造冲突

**动作场景:**
- 三种感官描写 (视觉+听觉+触觉)
- 短句加速 + 比喻减速 (节奏变化)
- 动作揭示角色特质 (不是描述特质，是展示)

**心理场景:**
- 认知失调的行为外显 (内心矛盾→身体反应)
- 隐喻系统连接世界观符号
- 价值天平描写 (角色在两类价值间摇摆)

**环境场景:**
- 空间透视变化: 宏观→异常焦点
- 非常规感官组合: "听见阳光的重量"
- 环境反映心理状态: 景语即情语

### 5.2 节奏×场景匹配

| 节奏档 | 场景类型 | 句长目标 | 对话比 | 结尾钩子 |
|--------|---------|---------|--------|---------|
| 快档 | 动作为主 | 短碎直 (8-15字) | 40-60% | 强钩(信息/悬念/反转) |
| 中档 | 对话+心理 | 长短交替 (12-22字) | 30-50% | 中钩(问题/情感) |
| 慢档 | 心理+环境 | 舒展 (18-28字) | 50-70% | 轻钩(情感/预示) |

### 5.3 高危场景预标注

| 场景类型 | 禁止内容 |
|---------|---------|
| 情感场景 | 禁止直接说出情绪词 ("他很愤怒"❌) |
| 打斗场景 | 禁止长句/复杂比喻/过多描写 |
| 对话场景 | 禁止纯信息交换式对话 (必须有冲突/潜台词) |
| 揭秘场景 | 禁止一次性全部揭示 |
| 过渡场景 | 禁止超过300字 |

---

## 六、质量保证技法 (Quality Assurance)

### 6.1 八维评分体系

8维20子维度加权评分 (权重): 情节(0.20) + 角色(0.18) + 文笔(0.12) + 世界观(0.10) + 主题(0.08) + 情感(0.12) + 阅读体验(0.12) + 预期(0.08)
→ ✅ qscore-calculator

### 6.2 InkOS 26维审计

OOC检查/时间线/节奏/利益链/年代考据/公式化转折/列表式/节奏单调/信息越界/配角降智/工具人/台词失真/支线停滞/弧线平坦/文风/词汇疲劳/爽点虚化/流水账/知识库污染/POV/段落等长/套话密度/设定冲突/战力崩坏/数值检查/伏笔检查
→ ✅ 映射到八维评分

### 6.3 一致性检测

| 技法 | 来源 | 状态 |
|------|------|------|
| **ETC过渡一致性熵**: 相邻章节因果重叠度 | WenShape | ✅ fabula-entropy |
| **EWC世界一致性熵**: 跨章事实矛盾检测+距离衰减 | WenShape | ✅ fabula-entropy |
| **3层知识过滤**: 冲突检测(删除重复>40%)/价值评估(关键vs次要)/结构重组(分4类) | AI_NovelGenerator | ❌ 需整合 |
| **内容去重规则**: <2章SKIP / 3-5章改写≥40% / >5章OK | AI_NovelGenerator | ❌ 需整合 |

### 6.4 文笔Lint规则体系 (← Vale + write-good)

| 规则类型 | 说明 | 中文移植 |
|---------|------|---------|
| existence | 词汇黑名单正则匹配 | ✅ 等价 deslop-scanner |
| substitution | 键值对替换建议 | ✅ "利用→用" |
| occurrence | 阈值计数(min/max) | ✅ 句长≤25/段长≤150 |
| repetition | 相邻重复检测 | ✅ "他他""的的" |
| conditional | X存在→Y必须存在 | ✅ 首字母缩略词须有全称 |
| consistency | 全文一致性 | ✅ "仿佛/好像"统一 |
| readability | 7种可读性公式 | ⚠️ 需中文等价替换 |

---

## 七、工具架构技法 (Tool Architecture)

### 7.1 已实现的工具链

```
novel-cli          ← 主编排器 (Commander风格)
deslop-scanner     ← 7类AI味检测 (text_humanizer.py完整移植)
beat-calculator    ← Save the Cat 15节拍 + 三档节奏
qscore-calculator  ← 八维20子维度 + InkOS 26维映射
fabula-entropy     ← ETC/EWC + 距离衰减 + JSONL事实管理
style-checker      ← 四维风格参数 + 六维偏差检测
knowledge-graph    ← 70+关系类型 + Union-Find + 图愈合
```

### 7.2 可参考的架构模式

| 模式 | 来源 | 值得借鉴 |
|------|------|---------|
| **LLM适配器工厂**: 8后端统一接口 | AI_NovelGenerator | 多模型路由 |
| **检查点恢复**: partial_architecture.json | AI_NovelGenerator | 长任务中断恢复 |
| **向量+关键词混合检索**: Chroma + LLM关键词生成 | AI_NovelGenerator | RAG集成 |
| **Tag内联标注**: @char: @pov: @plot: @world: | novelWriter | 正文元数据 |
| **状态×重要性双轴**: 进度+重要度正交追踪 | novelWriter | 项目管理 |
| **YAML规则扩展**: 12种规则类型声明式配置 | Vale | 风格规则引擎 |

---

## 八、缺口优先级矩阵

按 技法价值 × 实现难度 排序:

| 优先级 | 技法 | 价值 | 难度 | 行动 |
|--------|------|------|------|------|
| P0 | 雪花法10层集成到beat-calculator | ★★★★★ | 中 | 扩展beat-calculator |
| P0 | 角色状态五点追踪模板 | ★★★★★ | 低 | 更新novel-cli模板 |
| P1 | 场景技法系统 → 写入pre-writing-sop | ★★★★★ | 低 | 更新pre-writing-sop |
| P1 | 文笔Lint规则移植(中文) | ★★★★ | 中 | 扩展style-checker |
| P1 | 内容去重规则 → fabula-entropy | ★★★★ | 中 | 增强fabula-entropy |
| P2 | Show vs Tell检测 | ★★★★ | 高 | 新工具或style-checker扩展 |
| P2 | 具体vs抽象词比 | ★★★ | 低 | style-checker扩展 |
| P2 | 句式多样性评分 | ★★★ | 中 | style-checker扩展 |
| P3 | 叙事钩子自动追踪 | ★★★ | 高 | 新工具 |
| P3 | 信息释放节奏检测 | ★★★ | 高 | 新工具 |
