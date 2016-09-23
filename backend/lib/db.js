const mysql = require("mysql");
const pool = mysql.createPool({
  host     : '127.0.0.1',
  user     : 'root',
  password : '',
  database : 'chatdb'
});

//Custom wrapper for mysql to prevent boilerplate
exports.getConnection = (callback) => {
  pool.getConnection((err, conn) => {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
};
