# Lesson 06 · 网页页面布局

当前唯一版本：CampusScope — 2026 新生数据观察站。

## 在线访问

https://favorites-zhaoy.github.io/Visualization/

## 本地运行

在仓库根目录运行 `python -m http.server 8080`，访问 http://localhost:8080/ 。请通过 HTTP 打开，D3 需要读取 CSV。

## 课程内容

同一份80条虚构新生数据贯穿五节，每节都有 Before / After、讲解、关键代码和交互 Demo。

1. 页面骨架：视觉层级、盒模型、Flexbox、Layout X-Ray。
2. 网格布局：四种排列、12列网格、D3 Data Join。
3. 数据驱动布局：Equal Grid → D3 Treemap。
4. 多视图布局：Overview + Detail、Focus + Context、共享选择状态。
5. 响应式叙事：390–1440px视口模拟、ResizeObserver、四步滚动故事。

页面底部提供完整 Final Demo，支持班级选择、数据联动、键盘操作与重置。

## 数据校验

`node scripts/validate-data.js`

重新生成相同数据：`node scripts/generate-data.cjs`。固定种子20260917，无真实学生个人信息。CSV 是网页唯一数据来源。

## 文件结构

- `index.html`：当前网页入口。
- `css/`：课程与实验样式。
- `js/`：D3图表、教学内容、五节实验和完整观察站。
- `data/`：CSV和JSON教学数据。
- `vendor/`：D3 v7.9.0及许可证，本地加载，无需CDN。
- `scripts/`：数据生成与校验。

## 发布

GitHub Pages 使用 main 分支的仓库根目录，无构建步骤。所有链接使用相对路径，兼容项目子路径。

旧版页面和旧 Sites 配置已从当前分支移除；此前的 Git 提交历史保留，供必要时恢复。

课程结构参考 [李昕老师《可视化导论》模板](https://cinger007.github.io/vis/)，与视觉编码、空间组织、多视图协同主题衔接。所有学生记录均为虚构教学数据。
