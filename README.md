# Lesson 06 · CampusScope

当前版本：网页页面布局 v2。使用教材原图与黄绿、灰、深绿色视觉系统，以同一份80名虚构学生数据贯穿五节。

## 在线页面

https://favorites-zhaoy.github.io/Visualization/

## 本机项目地址

`C:\Users\zhaoy\Documents\ChatGPT\可视化导论\Lesson06_CampusScope`

在此目录运行 `python -m http.server 8080`，打开 http://localhost:8080/ 。请通过HTTP访问，避免直接打开HTML时浏览器阻止CSV读取。

## 五个布局实验

1. 页面骨架：Normal、真实尺寸X-Ray、五层3D展开与旋转。
2. 网格：同一批KPI的FLIP转换、12列、8–40px间距、平均年龄跨度。
3. 数据布局：Equal→Treemap连续变形、80个学生点与人数基准条。
4. 多视图：班级选择、年龄Brush与数字输入、Focus + Context、联动详情。
5. 响应式：390–1440px真实画布、横竖屏、实际容器规则、独立四步滚动故事。

每节保留讲解、关键代码与Demo。Final提供完整新生观察站。

## 数据与依赖

CSV与JSON沿用原文件，v2没有重新生成数据。页面仅加载一次CSV；所有交互从内存中的原数据计算。
D3 v7.9.0本地位于 `vendor/`，无需CDN或构建步骤。原数据生成脚本仅作出处留存，不需要运行。
封面位于 `assets/images/visualization-introduction-cover.jpg`，使用用户提供原图。

## 发布与文件

GitHub Pages使用main分支根目录。index.html为唯一入口；css/、js/、data/、assets/、vendor/为当前网页资源。旧版不再提供独立页面，Git提交历史可追溯。

课程结构参考 https://cinger007.github.io/vis/ 。教学数据均为虚构。
