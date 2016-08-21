const mysql = require("mysql");
const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'chatdb'
});

exports.getConnection = (callback) => {
  pool.getConnection((err, conn) => {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
};
