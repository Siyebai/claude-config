# /audit — 综合审计

## 用法
`/audit [--aspect code|security|deps|perf|all]`

## 参数
| 参数 | 说明 |
|------|------|
| `--aspect code` | 代码质量：复杂度、重复、规范 |
| `--aspect security` | 安全审计：密钥泄漏、注入、OWASP |
| `--aspect deps` | 依赖审计：过期、漏洞、冗余 |
| `--aspect perf` | 性能审计：瓶颈、内存、DB查询 |
| `--aspect all` | 全量审计（默认） |

## 执行
1. 根据aspect选择审计维度
2. 并行执行审计Agent
3. 生成综合报告 + 修复建议
4. 输出: `.audit-report.md`
