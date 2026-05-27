# 04 — 服务守护系统 v5.1

> 文件：`D:\Hermes\scripts\guardian_unified_v5.py`

## 概述

夜不悔统一守护系统 v5.1 — Windows 11 上的 AI 服务进程管理器。负责 4 个核心服务的启动、健康检查、内存监控、崩溃自动拉起。

## v5.1 新特性

| 特性 | 说明 |
|------|------|
| 智能放弃 | 连续 8 次重启失败后放弃，15 分钟后重试，防止死循环 |
| 心跳超时复活 | 守护进程被杀死后自动恢复 |
| 启动文件夹注册 | 确保开机自启 |
| 并行启动 | 所有服务线程并行启动，20s 超时 |

## 守护的服务

| 服务 | 端口 | 类型 | 健康检查 | 内存限制 |
|------|------|------|----------|----------|
| Hermes-API | 8642 | 主动管理 | HTTP health | 550MB |
| codex-relay | 4444 | 仅监控 | 端口检查 | 200MB |
| OpenClaw-GW | 18789 | 主动管理 | HTTP health | 400MB |
| Ollama | 11434 | 仅监控 | 端口检查 | 200MB |

## 配置常量

```python
CHECK_INTERVAL = 15        # 正常检查间隔（秒）
DEGRADED_INTERVAL = 5      # 服务异常时检查间隔
MAX_BACKOFF = 120          # 最大退避时间
RESTART_THRESHOLD = 2      # 连续失败 N 次触发重启
MEMORY_CHECK_INTERVAL = 6  # 内存检查周期（个循环）
MAX_CONSECUTIVE_RETRIES = 8     # 最大连续重启次数
ABANDONED_COOLDOWN = 900        # 放弃后的冷却时间（15分钟）
MAX_LOG_SIZE = 153600           # 日志轮转阈值
```

## 启动方式

### 手动启动
```bash
cd D:\Hermes
.venv\Scripts\pythonw.exe scripts\guardian_unified_v5.py
```

### 通过 Supervisor 自动恢复
Guardian Supervisor (`guardian_supervisor.py`) 监控 Guardian 心跳文件，若心跳超过 60s 未更新则重启 Guardian。

### 开机自启
Guardian 自动注册到 Windows 启动文件夹。

## 状态监控

```bash
# 查看心跳
cat D:\Hermes\.guardian_heartbeat
# {"pid": 15228, "ts": 1779865280, "version": "v5.1"}

# 查看锁文件
cat D:\Hermes\.guardian_unified.lock
# {"pid": 15228, "ts": 1779853637}

# 查看日志
tail -50 D:\Hermes\guardian_unified.log
```

## 添加新服务

三步操作：

### 1. 定义服务和内存限制
```python
MEMORY_LIMITS = {
    "新服务名": 300,  # MB
}

SERVICES = {
    "新服务名": {"port": PORT, "check_only": False, "health_url": "http://..."},
}
```

### 2. 编写启动函数
```python
NEW_SERVICE_EXE = r"C:\path\to\service.exe"

def start_new_service():
    log("Starting 新服务 (port XXXX)...", force=True)
    if port_check(PORT):
        log("新服务: already running")
        return True
    subprocess.Popen(
        [NEW_SERVICE_EXE, "--args"],
        creationflags=CREATE_NO_WINDOW | DETACHED,
    )
    for i in range(10):
        time.sleep(1)
        if port_check(PORT):
            log(f"新服务: UP after {i+1}s", force=True)
            return True
    return False
```

### 3. 注册到启动列表
```python
START_FUNCS = {
    "新服务名": start_new_service,
    # ... 其他服务
}
```

## 安全机制

- **文件锁**：基于 PID 的锁文件防止重复启动
- **内存保护**：超过限额的服务自动重启
- **冗余清理**：检测并清理旧的守护进程实例
- **磁盘告警**：C 盘空间 < 20% 时告警
- **崩溃日志**：守护进程自身崩溃写入 `guardian_crash.log`
- **自动恢复**：最多 10 次自动重启，退避策略（5s → 120s）

## 维护日志

### 2026-05-27
- 移除 CCSwitch (:11435) 服务
- 新增 codex-relay (:4444) 服务
- 重新启用 OpenClaw-GW (:18789) 服务
- 更新内存限制配置

### 历史
- v5.0: 移除 OpenClaw-GW（因频繁崩溃阻塞守护循环）
- v5.1: 智能放弃机制，OpenClaw-GW 重新加入
