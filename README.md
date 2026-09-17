# VISUAL ATLAS · Lesson 06

《可视化导论》数字展厅 / A digital exhibition of visualization ideas.

15 件原创 D3 微型作品贯穿五个网页布局知识点：Structure → Align → Compose → Focus → Reflow。顶部「中 / EN」切换完整课程、展品说明、控件及可访问标签，不刷新页面。

## 在线地址

https://favorites-zhaoy.github.io/Visualization/

## 本机项目地址

`C:\Users\zhaoy\Documents\ChatGPT\可视化导论\Lesson06_CampusScope`

目录名沿用原项目，目录内只有当前 VISUAL ATLAS 版本。

```powershell
cd "C:\Users\zhaoy\Documents\ChatGPT\可视化导论\Lesson06_CampusScope"
python -m http.server 8080
```

打开 http://localhost:8080/ 。必须通过 HTTP 访问，不能直接双击 HTML 加载数据。原生 HTML/CSS/JS + 本地 D3 v7，无构建步骤。字体使用 Google Fonts，可用系统字体回退。

## 课程与交互

- 开场：教材封面翻开，15 个不同的 D3 预览经过七种布局状态；支持重播、跳过和减少动态效果。
- 6.1 Structure：平铺/五主题语义分组/X-Ray/可拖动的五层 3D 模型。
- 6.2 Align：散落/松散对齐/等宽/模块网格；列辅助线、基线和 8–40px 真实间距。
- 6.3 Compose：作品优先级与纵横比决定列跨度，信息密度影响预览高度。可选择作品并调整三级优先级。
- 6.4 Focus：同一 keyed DOM 中放大焦点，保留其他作品为上下文；支持键盘与返回焦点。
- 6.5 Reflow：390–1440px 画布；实际容器断点为 680/1100px，CSS 负责 4/8/12 列，D3 更新 DOM 顺序及预览细节。
- Final：可筛选、原位聚焦、中英切换的完整展厅；包含布局骨架与数据下载。

每节含讲解、三个具体例子、关键代码、Demo 与 Takeaway。代码面板为教学精简片段；运行实现位于 js/。

## 数据

全部为合成教学数据，不代表真实测量、人物、机构。固定种子 20260917。

```powershell
node scripts/validate-visual-atlas-data.js
# All VISUAL ATLAS data checks passed.
```

`generate-visual-atlas-data.cjs` 可复现六份数据。15 件作品每课三件；实体30行、层次21节点、标量30行、点60行、时间序列144行。CVD 预览为配色与冗余编码比较，不是色觉缺陷模拟；Curve 展示已知生成模型与噪声观测；Storyline 是五轨迹构图示意，不是真实人物共现研究。

## 文件组织

- `index.html`：唯一页面入口。
- `css/atlas.css`、`atlas-opening.css`：编辑式视觉系统、容器查询、开场布局。
- `js/atlas-main.js`：五节课程及控件。
- `js/atlas-gallery.js`：共享 keyed Data Join、CSS span、FLIP、筛选、焦点、ResizeObserver。
- `js/atlas-content.js`：完整中英教学文本。
- `js/atlas-state.js`：即时语言状态。
- `js/preview-renderers.js`：15 种独立 D3 预览，三档细节。
- `js/atlas-opening.js`：可取消/重播的开场。
- `data/`：当前作品与教学微数据；`assets/`：用户提供的教材封面；`vendor/`：本地 D3 与许可证。

## 历史版本

CampusScope 最终版保存在 Git 标签 `campusscope-final`，对应提交 `079dede`。旧页面资源已移入本机回收站，发布目录中不保留旧版入口或学生数据。

课程章节结构参考 https://cinger007.github.io/vis/ 。15 个微型可视化均为本项目重新制作，未复制教师页面截图或源码。
