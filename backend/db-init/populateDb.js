const mysqlWrap = require("../lib/db.js")

mysqlWrap.getConnection((err, mclient) => {
  if (err) {
    throw err;
  }
  else {
    mclient.query("TRUNCATE ChannelsTable", (err, results) => {
      if (err) {
        throw err;
      }
      else {
        mclient.query("ALTER TABLE ChannelsTable AUTO_INCREMENT = 1", (err, results) => {
          if (err) {
            throw err;
          }
          else {
            mclient.query("INSERT INTO ChannelsTable (chan_id, chan_name) VALUES (DEFAULT, 'general')", (err, results) => {
              if (err) {
                throw err;
              }
              else {
                console.log("Db successfully popularted!");
              }
            });
          }
        });
      }
    });
  }
});
