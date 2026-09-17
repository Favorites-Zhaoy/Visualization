import { dashboard } from "./charts.js?v=3";
import { dispatch, classNames } from "./data.js?v=3";
import { cleanupWith } from "./lifecycle.js?v=3";

export function init64() {
  const product = dashboard("#demo64", { xray: false });
  const host = d3.select(product.el);
  const note = host.insert("p", ":first-child")
    .attr("class", "probe-explanation").attr("role", "status").property("hidden", true);
  let flashTimer;
  function handleProbe(event) {
    const { lesson, probe } = event.detail || {};
    if (lesson !== "64" || !["dispatch", "brush"].includes(probe)) return;
    dispatch.call("viewMode", null, "overview-detail");
    dispatch.call("selectClass", null, classNames[2]);
    dispatch.call("ageRange", null, probe === "brush" ? [18, 19] : null);
    note.property("hidden", false).text(probe === "dispatch"
      ? "d3.dispatch()：选择数据科学1班；详情、兴趣和记录共用这一次选择。"
      : "d3.brushX()：筛选 18–19 岁；柱状图保留当前班级全貌，详情与记录呈现交集。拖动选区继续探索。");
    const target = host.select(probe === "brush" ? ".age-chart" : ".selection-state");
    host.selectAll(".probe-flash").classed("probe-flash", false);
    clearTimeout(flashTimer);
    target.classed("probe-flash", true);
    flashTimer = setTimeout(() => target.classed("probe-flash", false), 900);
  }
  window.addEventListener("lesson-probe", handleProbe);
  return { destroy: cleanupWith(() => {
    clearTimeout(flashTimer);
    window.removeEventListener("lesson-probe", handleProbe);
    product.destroy();
  }) };
}
