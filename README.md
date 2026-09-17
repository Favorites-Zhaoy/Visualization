# MY WEEK · Lesson 06 网页页面布局

同一份课表，在不同阅读任务和屏幕上，需要不同的空间组织。

本版按用户指定，恢复「80个学生」版本 `campusscope-final` 的课程外壳：浅黄绿色封面、居中教材、翻书开场、圆点章节导航、五张示意图入口、讲解／关键代码／Demo。课堂案例替换为 MY WEEK，未恢复旧学生数据或数字展厅。

## 在线与本机

https://favorites-zhaoy.github.io/Visualization/

本机目录：`C:\Users\zhaoy\Documents\ChatGPT\可视化导论\Lesson06_CampusScope`

```powershell
cd "C:\Users\zhaoy\Documents\ChatGPT\可视化导论\Lesson06_CampusScope"
python -m http.server 8080
```

打开 http://localhost:8080/ 。HTML/CSS/ES Modules + 本地 D3 v7，无构建步骤。请通过 HTTP 访问，避免 file:// 导致 CSV 加载失败。Google Fonts 为可选字体，有系统字体回退。

## 五节课堂案例

1. **STRUCTURE**：传统课表 → 信息页面 → X-Ray → 五层3D；结构参数默认隐藏。
2. **POSITION**：同一11个 keyed 课程块在列表与时间网格间切换；D3 的 7天×11节与 CSS 页面列分开演示。
3. **HIERARCHY**：整周／周四／可视化导论三种问题改变真实区域宽度和DOM顺序；FLIP保持视觉连续性。
4. **FOCUS**：日期与课程可通过图表或文本按钮选择；全部课程保留在原时间位置；返回整周或Esc清除。
5. **REFLOW**：320–1440px真实容器实验，预设1440/768/390、横竖屏、阅读顺序；断点680/1100px。

Final 默认聚焦周四，以一行摘要、当天课程、整周课表、每日课量、课程汇总组成可使用的学生信息页。手机先展示选中日，完整周课表通过按钮展开，只在图表内部横向滚动。

顶部「中 / EN」切换完整课程、控件、作品说明和无障碍标签，不刷新页面；楼宇名称按原数据保留中文。

## 数据与隐私

公开站点只加载一次 `data/my_week_schedule_public.csv` 与 `data/my_week_meta.json`。原始公开CSV保持不变。由D3统一计算：11次上课、5门课程、23节、5个有课日；每日和课程汇总不在图表中硬编码。

`data/my_week_schedule_exact.csv` 是用户提供的本地精确版，已加入 `.gitignore`，不提交或加载到公开页面。不要对本地目录做绕过 Git 的全目录上传。若需本地精确演示，可在个人副本中切换CSV，并把 `location_exact` 映射到视图使用的 `location`。

仅使用第1–11节，不推断钟点。英文课程名是展示翻译，不声称是官方英文名。

```powershell
node scripts/validate-my-week-data.js
# All MY WEEK timetable checks passed.
```

## 源码

- `js/week-data.js`：一次加载、UTC日历、课程色与D3派生汇总。
- `js/week-views.js`：共享页面区域、问题驱动构图、FLIP、响应式与焦点状态。
- `js/week-charts.js`：D3时间位置、keyed11课程块、两个条形汇总。
- `js/week-main.js`：课程、真实源码区域提取、导航、控件与最终页。
- `js/week-content.js`：每节三个真实课表示例，完整中英讲解。
- `js/week-state.js`：复用的双语框架与DOM辅助函数。
- `js/week-opening.js`：同一个 WeekView 的六阶段开场，支持取消、重播、跳过与减少动态效果。
- `css/week-base.css`：复用的基础课程样式；`course-reference.css`：80人版课程外观映射；`week.css`：课表页面布局；其余两份样式负责图表和开场。

代码Tab从实际运行源码的 `snippet` 区域读取，不维护另外一份示例代码。精简上下文课表仍显示完整七天，移动端详细课表保留可读宽度并局部滚动。

## 历史与清理

- `campusscope-final`：80名学生版本，作为本次布局参考。
- `visual-atlas-final`：上一个已发布版本。
- 当前开发前的MY WEEK初稿已保存在工作区 `.sites-runtime/backups/`，不属于发布目录。
- 旧版活动资源已移入回收站；公开目录只包含当前页面所需资源。
