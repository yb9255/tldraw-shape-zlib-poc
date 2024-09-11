/* eslint @typescript-eslint/no-var-requires: "off" */

const fs = require('fs');
const sql = require('better-sqlite3');

const hasDBFileBefore = fs.existsSync('shapes.db');
const db = sql('shapes.db');

const mockShapes = {
  id: 0,
  buffer: null,
  vw: null,
  vh: null,
};

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS shapes (
    id INTEGER PRIMARY KEY,
    buffer BLOB,
    vw INT,
    vh INT
  )
`
).run();

if (!hasDBFileBefore) {
  const stmt = db.prepare(`
    INSERT INTO shapes VALUES (
      @id,
      @buffer,
      @vw,
      @vh
    )
  `);

  stmt.run(mockShapes);
}

module.exports = db;
