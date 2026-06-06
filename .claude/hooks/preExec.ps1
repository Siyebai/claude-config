# preExec hook — 端口清理 + CCSwitch健康检查
# 每5分钟最多执行一次，避免每次命令都延迟
$marker = "$env:USERPROFILE\.claude\cache\.cleanup-marker"
$now = Get-Date
$stale = $true

if (Test-Path $marker) {
  $last = Get-Item $marker
  if ($now -lt $last.LastWriteTime.AddMinutes(5)) { $stale = $false }
}

function Check-CCSwitch {
  try {
    $req = [System.Net.WebRequest]::Create("http://127.0.0.1:11435/healthz")
    $req.Timeout = 2000
    $resp = $req.GetResponse()
    if ($resp.StatusCode -eq 200) { return $true }
  } catch { return $false }
}

if ($stale) {
  # 不杀 node 进程，只杀 port 5000/3000 上的 dev 服务
  $ports = @(5000, 3000, 3001, 3002)
  $toKill = @()
  foreach ($port in $ports) {
    $conn = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
    if ($conn) {
      $pid = ($conn -split '\s+')[-1]
      if ($pid -and $pid -ne '0') { $toKill += $pid }
    }
  }
  # 跳过 CCSwitch (11435)
  $ccswitch = netstat -ano | Select-String ":11435 " | Select-String "LISTENING"
  $ccPid = $null
  if ($ccswitch) { $ccPid = ($ccswitch -split '\s+')[-1] }

  $toKill | Where-Object { $_ -ne $ccPid } | ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  if ($toKill.Count -gt 0) {
    Write-Output "[preExec] Killed $($toKill.Count) stale dev processes"
  }

  # CCSwitch 健康检查 — 不存活则自动重启
  $healthy = Check-CCSwitch
  if (-not $healthy) {
    $csDir = "$env:USERPROFILE\.claude\ccswitch-deepseek"
    if (Test-Path "$csDir\ccswitch.cmd") {
      Start-Process -FilePath "$csDir\ccswitch.cmd" -WindowStyle Hidden
      Write-Output "[preExec] CCSwitch was down, auto-restarted"
    }
  }

  New-Item $marker -ItemType File -Force -ErrorAction SilentlyContinue | Out-Null
}
