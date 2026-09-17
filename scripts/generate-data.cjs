const fs = require("node:fs");
let seed = 20260917;
const rnd = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const expand = (o) => Object.entries(o).flatMap(([v, n]) => Array(n).fill(v));
const classes = ["软件工程1班", "软件工程2班", "数据科学1班", "数字媒体1班"];
const sizes = [26, 22, 18, 14],
  male = [14, 12, 9, 7],
  interests = ["前端开发", "数据分析", "人工智能", "视觉设计"];
const matrix = [
  [11, 6, 5, 4],
  [7, 5, 7, 3],
  [3, 8, 4, 3],
  [3, 2, 3, 6],
];
const ages = shuffle(expand({ 17: 8, 18: 45, 19: 22, 20: 5 }));
const provinces = shuffle(
  expand({
    广东: 14,
    湖南: 11,
    湖北: 10,
    江苏: 8,
    浙江: 7,
    四川: 6,
    河南: 5,
    山东: 5,
    安徽: 4,
    江西: 4,
    福建: 3,
    广西: 3,
  }),
);
const region = {
  广东: "华南",
  广西: "华南",
  湖南: "华中",
  湖北: "华中",
  河南: "华中",
  四川: "西南",
  江苏: "华东",
  浙江: "华东",
  山东: "华东",
  安徽: "华东",
  江西: "华东",
  福建: "华东",
};
let rows = [];
classes.forEach((name, c) => {
  const genders = shuffle([
    ...Array(male[c]).fill("男"),
    ...Array(sizes[c] - male[c]).fill("女"),
  ]);
  const ints = shuffle(
    matrix[c].flatMap((n, j) => Array(n).fill(interests[j])),
  );
  for (let i = 0; i < sizes[c]; i++) {
    const score = Math.round(
      [585, 582, 594, 586][c] + (rnd() + rnd() + rnd() - 1.5) * 42,
    );
    rows.push({
      class_name: name,
      gender: genders[i],
      admission_score: Math.max(520, Math.min(650, score)),
      interest: ints[i],
    });
  }
});
rows = shuffle(rows).map((r, i) => ({
  student_id: `S${String(i + 1).padStart(3, "0")}`,
  class_name: r.class_name,
  gender: r.gender,
  age: +ages[i],
  province: provinces[i],
  region: region[provinces[i]],
  admission_score: r.admission_score,
  interest: r.interest,
}));
fs.writeFileSync("data/students.json", JSON.stringify(rows, null, 2));
fs.writeFileSync(
  "data/students.csv",
  Object.keys(rows[0]).join(",") +
    "\n" +
    rows.map((r) => Object.values(r).join(",")).join("\n") +
    "\n",
);
console.log("Generated 80 synthetic students; seed=20260917");
