const fs = require("node:fs"),
  assert = require("node:assert/strict");
try {
  const [header, ...lines] = fs
    .readFileSync("data/students.csv", "utf8")
    .trim()
    .split(/\r?\n/);
  const keys = header.split(",");
  const rows = lines.map((l) =>
    Object.fromEntries(l.split(",").map((v, i) => [keys[i], v])),
  );
  const check = (label, fn) => {
    fn();
    console.log("✓ " + label);
  };
  check("总行数 = 80", () => assert.equal(rows.length, 80));
  check("student_id 唯一且为 S001–S080", () =>
    assert.deepEqual(
      rows.map((r) => r.student_id).sort(),
      Array.from(
        { length: 80 },
        (_, i) => `S${String(i + 1).padStart(3, "0")}`,
      ),
    ),
  );
  const counts = (field, want) =>
    check(field + " 人数正确", () =>
      assert.deepEqual(
        rows.reduce((o, r) => ((o[r[field]] = (o[r[field]] || 0) + 1), o), {}),
        want,
      ),
    );
  counts("class_name", {
    软件工程1班: 26,
    软件工程2班: 22,
    数据科学1班: 18,
    数字媒体1班: 14,
  });
  counts("gender", { 男: 42, 女: 38 });
  counts("age", { 17: 8, 18: 45, 19: 22, 20: 5 });
  counts("province", {
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
  });
  counts("interest", {
    前端开发: 24,
    数据分析: 21,
    人工智能: 19,
    视觉设计: 16,
  });
  check("admission_score 整数且在520–650；均值575–600", () => {
    assert(
      rows.every(
        (r) =>
          Number.isInteger(+r.admission_score) &&
          +r.admission_score >= 520 &&
          +r.admission_score <= 650,
      ),
    );
    const mean = rows.reduce((a, r) => a + +r.admission_score, 0) / 80;
    assert(mean >= 575 && mean <= 600);
  });
  check("无空字段、无真实姓名字段", () => {
    assert.deepEqual(keys, [
      "student_id",
      "class_name",
      "gender",
      "age",
      "province",
      "region",
      "admission_score",
      "interest",
    ]);
    assert(rows.every((r) => keys.every((k) => r[k]?.trim())));
  });
  check("各班男女比例35%–65%；班均分差<20", () => {
    const means = [];
    for (const name of new Set(rows.map((r) => r.class_name))) {
      const a = rows.filter((r) => r.class_name === name),
        p = a.filter((r) => r.gender === "男").length / a.length;
      assert(p >= 0.35 && p <= 0.65);
      means.push(a.reduce((s, r) => s + +r.admission_score, 0) / a.length);
    }
    assert(Math.max(...means) - Math.min(...means) < 20);
  });
  check("JSON 与 CSV 一致", () =>
    assert.deepEqual(
      JSON.parse(fs.readFileSync("data/students.json", "utf8")).map((r) =>
        Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)])),
      ),
      rows,
    ),
  );
  console.log("All validation checks passed.");
} catch (e) {
  console.error("Validation failed:", e.message);
  process.exit(1);
}
