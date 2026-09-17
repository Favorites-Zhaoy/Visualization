import { initChapterMap } from "./chapter-map.js?v=2";
import { initOpening } from "./opening.js?v=2";
import { loadData, kpis } from "./data.js?v=2";
import { buildCourse } from "./content.js?v=2";
import { diagram, treemap } from "./charts.js?v=2";
import { init61 } from "./lesson61.js?v=2";
import { init62 } from "./lesson62.js?v=2";
import { init63 } from "./lesson63.js?v=2";
import { init64 } from "./lesson64.js?v=2";
import { init65 } from "./lesson65.js?v=2";
import { initFinal } from "./final-demo.js?v=2";
import { initNav } from "./nav.js?v=2";
async function main() {
  await loadData();
  buildCourse();
  initChapterMap();
  d3.selectAll(".lesson").each(function (d) {
    diagram(d3.select(this).select(".before svg"), +d.no.slice(-1), false);
    diagram(d3.select(this).select(".after svg"), +d.no.slice(-1), true);
  });
  initOpening();
  init61();
  init62();
  init63();
  init64();
  init65();
  initFinal();
  initNav();
  document.documentElement.dataset.ready = "true";
  if (location.hash) {
    try {
      const anchor = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
      requestAnimationFrame(() => anchor?.scrollIntoView());
    } catch {
      /* 无效锚点保留在首页 */
    }
  }
}
main().catch((error) => {
  console.error(error);
  const box = document.querySelector("#load-error");
  box.hidden = false;
  box.textContent =
    "课程数据未能加载。请使用本地 HTTP 服务打开页面，并检查 data/students.csv 是否存在。刷新后重试。";
});
