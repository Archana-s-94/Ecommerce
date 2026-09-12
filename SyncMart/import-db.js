const fs = require("fs");
const mysql = require("mysql2");

const sql = fs.readFileSync("database/syncmart.sql", "utf8");

const conn = mysql.createConnection({
  host: "sakura.proxy.rlwy.net",
  user: "root",
  password: process.env.RAILWAY_DB_PASSWORD,
  database: "railway",
  port: 41906,
  multipleStatements: true,
});

conn.connect(function (err) {
  if (err) {
    console.log("Connection failed:", err.message);
    return;
  }

  console.log("Connected to Railway MySQL");

  conn.query(sql, function (err) {
    if (err) {
      console.log("Import failed:", err.message);
      conn.end();
      return;
    }

    console.log("SyncMart database imported successfully!");
    conn.end();
  });
});
