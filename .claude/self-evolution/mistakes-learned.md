# 踩坑记录 · 经验教训

## 2026-05-18

### 1. GitHub API 调用
- **坑**：grep -P 在 Windows Git Bash 不支持
- **解决**：改用 Node.js 脚本调用 GitHub API
- **教训**：Windows 环境下优先用 Node.js 而非 shell 文本处理

### 2. 文件命名编码
- **坑**：中文文件名在 Windows API 中编码异常，导致 `????-?????.md` 保存失败
- **解决**：通过 GitHub Contents API 直接下载（download_url）
- **教训**：处理中文路径时注意编码转换

### 3. Git Push 网络阻断
- **坑**：GitHub HTTPS 直连被重置（GFW）
- **解决**：通过 GitHub Contents API (PUT) 逐文件上传
- **教训**：GitHub 大文件上传备选方案——Contents API

### 4. DeepSeek Chat 不支持 Vision
- **坑**：网页上传图片后 API 无响应
- **解决**：服务器端检测图片，改为文字提示
- **教训**：API 能力验证要先于功能开发

### 5. HTML 模板字符串转义
- **坑**：`<\/script>` 在模板字符串中破坏了 HTML 解析
- **解决**：改为从磁盘读取独立 HTML 文件
- **教训**：避免在 Node.js 模板字符串中内嵌 HTML/JS

## 2026-05-18

### 6. GitHub 仓库文件名编码（二轮探索再次确认）
- **坑**：GitHub API tree 返回的中文文件名在 Windows 上写入时丢失编码（novel/????-?????.md）
- **解决**：Contents API 可获取 download_url，通过重定向下载
- **教训**：Windows 环境处理非 ASCII 路径时使用 Contents API 而非 Tree API

### 7. 仓库文件规模爆炸（node_modules 污染）
- **坑**：68-layer-global-architecture 仓库含 10,158 文件（原因是 github_sync/node_modules 被提交）
- **解决**：过滤 node_modules 路径，只关注核心文件
- **教训**：克隆前先用 Tree API 扫描文件列表，过滤无用目录
