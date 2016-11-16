//This scripts looks at the contents of a few files and checks if the
//db connection was released

const Promise = require("bluebird");
const fsPromise = require("fs-promise");

const filesToReadFrom = ["../lib/auth.js", "../lib/channel.js", "../lib/chat.js", "../lib/middleware.js", "../lib/socketio.js", "../lib/user.js"];
const filesToReadFromArray = [];
const resultsStripped = [];

filesToReadFrom.forEach((val) => {
  filesToReadFromArray.push(fsPromise.readFile(val, "utf8"));
});

Promise.all(filesToReadFromArray)
.then((results) => {
  for (let i = 0;i<results.length;i++) {
    resultsStripped.push(results[i].split("\n"));
  }


  for (let i = 0;i<resultsStripped.length;i++) {
    for (let n = 0;n<resultsStripped[i].length;n++) {
      if (resultsStripped[i][n].includes("mclient.query(\"")) {
        if (resultsStripped[i][n+1].includes("mclient.release()") === false) {
          console.log(`I FOUND SOMETHING in: ${filesToReadFrom[i]} on line: ${n + 1}`);

        }

      }
    }
  }
});
