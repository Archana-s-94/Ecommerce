var mysql = require("mysql2");

var conn = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "syncmart",
  port: process.env.MYSQLPORT || 3306,
});

conn.connect(function (err) {
  if (err) {
    console.log("Database connection error:", err);
    throw err;
  }

  console.log("Database Connected!");
});

module.exports = conn;
