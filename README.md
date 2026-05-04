# Data Collection Tools

用于数据采集系统的浏览器增强脚本（Tampermonkey）。

## 功能

### 1. 进度分析工具
- 自动抓取页面数据（fetch / XHR）
- 分析任务链路（采集 → 解析 → 质检 → 标注 → 审核）
- 分类未完成任务
- 支持 CSV 导出
- 可视化面板

### 2. 自动化操作工具
- 自动创建实例任务
- 自动分配标注任务
- 支持 Element Plus 下拉选择
- 批量操作（全选 / 取消全选）
- 可配置操作延迟

## 使用方式

1. 安装 Tampermonkey
2. 导入 .user.js 脚本
3. 打开目标系统页面（collect.galbot.com）
4. 使用页面右下角工具面板

## 技术点

- 浏览器请求拦截（fetch / XMLHttpRequest）
- DOM 操作与事件模拟
- 前端状态管理（localStorage）
- UI 注入（面板系统）

## 说明

该工具用于提升数据标注与任务管理效率。# data-collection-tools
Tampermonkey scripts for data collection automation and progress analysis
