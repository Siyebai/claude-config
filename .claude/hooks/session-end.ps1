# Session End hook — 按端口清理 + 备份 + 日志
# 防止误杀 CCSwitch/Codex（lessons-learned #21 修正版）

$logEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] session-end: "

# 1. 按端口杀残留 dev 服务（不影响 CCSwitch :11435 和 Codex）
$ports = @(5000, 3000, 3001, 3002)
$killed = 0
foreach ($port in $ports) {
  $conn = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
  if ($conn) {
    $pid = ($conn -split '\s+')[-1]
    if ($pid -and $pid -ne '0') {
      Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      $killed++
    }
  }
}
if ($killed -gt 0) { $logEntry += "Killed $killed stale dev processes. " }

# 2. 清理 stale lock
$lockFile = "$env:USERPROFILE\..\智能体共和国\portal-v3\.next\lock"
if (Test-Path $lockFile) { Remove-Item $lockFile -Force -ErrorAction SilentlyContinue }

# 3. 压缩大会话文件 + 时间戳备份
$d = "$env:USERPROFILE\.claude\backups"
if (!(Test-Path $d)) { mkdir $d -Force | Out-Null }
$trimmed = 0
Get-ChildItem "$env:USERPROFILE\.claude\projects\C--Users----" -Recurse -Filter *.jsonl -ErrorAction SilentlyContinue |
  Where-Object { $_.Length -gt 500KB } | ForEach-Object {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$d\$($_.BaseName)-$ts.bak"
    if (!(Test-Path $bak)) { Copy-Item $_.FullName $bak -Force }
    $c = Get-Content $_.FullName
    if ($c.Count -gt 60) {
      ($c | Select-Object -First 3) + ($c | Select-Object -Last 50) | Set-Content $_.FullName
      $trimmed++
    }
  }
if ($trimmed -gt 0) { $logEntry += "Trimmed $trimmed large session files. " }

# 4. 写入清理日志
$logEntry += "Cleanup done."
$logFile = "$env:USERPROFILE\.claude\.last-cleanup"
Add-Content -Path $logFile -Value $logEntry -ErrorAction SilentlyContinue
Write-Output "[end] $logEntry"
