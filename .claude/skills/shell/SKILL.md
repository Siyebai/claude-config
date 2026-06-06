---
name: shell
description: Shell命令执行与调试 — 安全执行、错误捕获、管道规范
triggers: ["执行命令", "shell", "终端", "运行", "启动", "命令行"]
weight: medium
---

# Shell 技能

## 安全执行规则

1. **读前先查**: 执行删除/覆盖命令前，先用 `ls`/`cat`确认目标
2. **管道显式化**: 复杂管道先分步执行验证中间结果
3. **错误捕获**: 执行后检查exit code + stderr，不忽略警告
4. **路径安全**: Windows路径用 `/c/Users/...` 格式，不混用 `\`
5. **并发安全**: 后台任务用 `run_in_background=true`，不用 `&`

## 调试模式

```bash
# 调试bash脚本
bash -x script.sh

# 查看exit code
echo $?
```

## 常用模式

```bash
# 安全删除前先预览
ls -la target-dir/
# 确认后再操作
rm -rf target-dir/

# 管道调试：逐步执行
cmd1 | head 20    # 先看输出
cmd1 | cmd2 | head 20  # 再加管道
```

## 适用场景

- 执行单次命令或脚本
- 调试shell错误
- 文件/目录操作
- 进程管理
- 环境检查
