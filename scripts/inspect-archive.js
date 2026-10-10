const fs = require("fs");
const initSqlJs = require("sql.js");
(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(process.argv[2]));
  const q = (s) => {
    const r = db.exec(s);
    return r.length ? r[0].values : [];
  };
  console.log("objects:", JSON.stringify(q("SELECT name FROM objects")));
  console.log("sources total:", JSON.stringify(q("SELECT COUNT(*) FROM sources")[0]));
  console.log("sources w/ nasa_id:", JSON.stringify(q("SELECT COUNT(*) FROM sources WHERE nasa_id IS NOT NULL")[0]));
  console.log("sources w/ nasa_id AND not 'YouTube':", JSON.stringify(q("SELECT COUNT(*) FROM sources WHERE nasa_id IS NOT NULL AND nasa_id <> 'YouTube'")[0]));
  console.log("sources cols:", JSON.stringify(q("PRAGMA table_info(sources)").map((r) => r[1])));
})();