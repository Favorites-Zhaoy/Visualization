export const state = {
  students: [],
  selectedClass: null,
  viewMode: "overview-detail",
  layoutMode: "treemap",
  viewportWidth: 1440,
  storyStep: 0,
};
export const classNames = [
  "软件工程1班",
  "软件工程2班",
  "数据科学1班",
  "数字媒体1班",
];
export const colors = ["#5c5fc9", "#2e7888", "#956825", "#a64d70"];
export const color = (name) => colors[classNames.indexOf(name)] || "#6366d7";
export const duration = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800;
export async function loadData() {
  state.students = await d3.csv("data/students.csv", (d) => ({
    ...d,
    age: +d.age,
    admission_score: +d.admission_score,
  }));
  return state.students;
}
export function classCounts() {
  return d3
    .rollups(
      state.students,
      (v) => v.length,
      (d) => d.class_name,
    )
    .sort((a, b) => classNames.indexOf(a[0]) - classNames.indexOf(b[0]))
    .map(([name, value]) => ({ name, value }));
}
export const selectedRows = () =>
  state.students.filter(
    (d) => !state.selectedClass || d.class_name === state.selectedClass,
  );
export function kpis(rows = state.students) {
  return [
    { label: "总人数", value: rows.length, unit: "人", span: 3 },
    {
      label: "班级数",
      value: new Set(rows.map((d) => d.class_name)).size,
      unit: "个",
      span: 2,
    },
    {
      label: "平均年龄",
      value: d3.mean(rows, (d) => d.age)?.toFixed(1) || "—",
      unit: "岁",
      span: 3,
    },
    {
      label: "男生比例",
      value: rows.length
        ? d3.format(".1%")(
            rows.filter((d) => d.gender === "男").length / rows.length,
          )
        : "—",
      unit: "",
      span: 2,
    },
    {
      label: "省份",
      value: new Set(rows.map((d) => d.province)).size,
      unit: "个",
      span: 2,
    },
  ];
}
export const dispatch = d3.dispatch("selectClass", "viewMode");
dispatch
  .on("selectClass.state", (name) => {
    state.selectedClass = name;
  })
  .on("viewMode.state", (mode) => {
    state.viewMode = mode;
  });
