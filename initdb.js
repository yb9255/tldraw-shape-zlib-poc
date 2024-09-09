/* eslint @typescript-eslint/no-var-requires: "off" */

const sql = require("better-sqlite3");
const db = sql("shapes.db");

// const mockShapes = {
//   id: 0,
//   buffer: null,
// };

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS shapes (
    id INTEGER PRIMARY KEY,
    buffer BLOB
  )
`
).run();

// function initData() {
//   const stmt = db.prepare(`
//     INSERT INTO shapes VALUES (
//       @id,
//       @buffer
//     )
//   `);

//   stmt.run(mockShapes);
// }

// initData();

module.exports = db;
