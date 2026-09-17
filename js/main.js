import { loadData, kpis } from "./data.js";
import { buildCourse } from "./content.js";
import { diagram, treemap } from "./charts.js";
import { init61 } from "./lesson61.js";
import { init62 } from "./lesson62.js";
import { init63 } from "./lesson63.js";
import { init64 } from "./lesson64.js";
import { init65 } from "./lesson65.js";
import { initFinal } from "./final-demo.js";
import { initNav } from "./nav.js";
async function main() {
  await loadData();
  buildCourse();
  d3.selectAll(".card-art").each(function () {
    const d = d3.select(this.closest(".knowledge-card")).datum();
    diagram(
      d3
        .select(this)
        .append("svg")
        .attr("aria-label", d.short + "布局示意"),
      +d.no.slice(-1),
      true,
    );
  });
  d3.selectAll(".lesson").each(function (d) {
    diagram(d3.select(this).select(".before svg"), +d.no.slice(-1), false);
    diagram(d3.select(this).select(".after svg"), +d.no.slice(-1), true);
  });
  const heroMetrics = kpis().filter((d) =>
    ["总人数", "班级数", "平均年龄"].includes(d.label),
  );
  d3.select("#hero-kpis")
    .selectAll("div")
    .data(heroMetrics)
    .join("div")
    .html((d) => `<b>${d.value}</b><span>${d.label} / ${d.unit}</span>`);
  const hero = treemap("#hero-viz", { height: 180 });
  let dataLayout = true;
  d3.select("#hero-toggle").on("click", function () {
    dataLayout = !dataLayout;
    hero.update({ mode: dataLayout ? "treemap" : "equal" });
    this.setAttribute("aria-pressed", dataLayout);
    this.textContent = dataLayout ? "切换为等宽网格 ⇄" : "切换为数据布局 ⇄";
    d3.select("#hero-caption").text(
      dataLayout
        ? "面积映射人数，差异一眼可见"
        : "四块空间等大，但人数并不相等",
    );
  });
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
