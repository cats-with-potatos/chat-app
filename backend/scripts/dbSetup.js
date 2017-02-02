/*const mysql = require('promise-mysql');
let connection;


let userTableData;
let ChannelTableData;
let MessagesTableData;
let UserInChannelData;
let PrivateMessagesData;


const ut_create_query = `CREATE TABLE IF NOT EXISTS UserTable (
user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
username VARCHAR(32) BINARY NOT NULL UNIQUE,
password VARCHAR (128) NOT NULL,
salt VARCHAR (32) NOT NULL,
PRIMARY KEY (user_id));`;



// Query to create Channels table
const ct_create_query = `CREATE TABLE IF NOT EXISTS ChannelsTable (
chan_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
chan_name VARCHAR(64) NOT NULL UNIQUE,
PRIMARY KEY (chan_id));`;

// Query to create Messages table
const mt_create_query = `CREATE TABLE IF NOT EXISTS MessagesTable (
message_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
contents VARCHAR(256) NOT NULL,
sender VARCHAR(32) NOT NULL,
chan_link_id INT UNSIGNED NOT NULL,
message_date BIGINT(20) NOT NULL,
PRIMARY KEY (message_id));`;

const uic_create_query = `CREATE TABLE IF NOT EXISTS UserInChannel (
  inchan_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  inchan_userid INT UNSIGNED NOT NULL,
  inchan_channel_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (inchan_id));`;

const pm_create_query =   `CREATE TABLE IF NOT EXISTS PrivateMessages (
  pm_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pm_from INT UNSIGNED NOT NULL,
  pm_to INT UNSIGNED NOT NULL,
  pm_message VARCHAR(256) NOT NULL,
  pm_date DATETIME NOT NULL,
  PRIMARY KEY (pm_id)
)`


const createTableArray = [ut_create_query, ct_create_query, mt_create_query, uic_create_query, pm_create_query];


let userTableArray;
let ChannelTableArray;
let MessagesTableArray;
let UserInChannelArray;
let PrivateMessagesArray;


mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "chatdb",
  password: "",
}).then((conn) => {
  connection = conn;
  return connection.query("SELECT * FROM UserTable");
})
.then((UTData) => {
  userTableData = UTData
  return connection.query("SELECT * FROM ChannelsTable");
})
.then((CTData) => {
  ChannelTableData = CTData;
  return connection.query("SELECT * FROM MessagesTable");
})
.then((MTData) => {
  MessagesTableData = MTData;
  return connection.query("SELECT * FROM UserInChannel");
})
.then((UICData) => {
  UserInChannelData = UICData;
  return connection.query("SELECT * FROM PrivateMessages");
})
.then((PMData) => {
  PrivateMessagesData = PMData;
  return connection.query("DROP DATABASE IF EXISTS chatdb")
})
.then((results) => {
  return connection.query("CREATE DATABASE chatdb")
})
.then((results) => {
  const createTablePromises = [];

  return mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "chatdb",
    password: "",
  });
})
.then((conn) => {
  connection = conn;
  createTableArray.forEach((val) => {
    createTablePromises.push(connection.query(val));
  });

  return Promise.all(createTablePromises);
})
.then((results) => {
 console.log(userTableData);
 console.log(ChannelTableData);
 console.log(MessagesTableData);
 console.log(UserInChannelData);
 console.log(PrivateMessagesData);

  userTableData.forEach((val) => {
    userTableArray.push("INSERT INTO UserTable (user_id, username, password, salt) VALUES (DEFAULT, ?, ?, ?)", val.username, val.password, val.salt);
  });

  return Promise.all(userTableArray);
})
.then((results) => {

  ChannelTableData.forEach((val) => {
    ChannelTableArray.push("INSERT INTO ChannelTableArray (chan_id, chan_name) VALUES (DEFAULT, ?)", [val.chan_name]);
  });

  return Promise.all(ChannelTableArray);
})
.then((results) => {

  MessagesTableData.forEach((val) => {
    MessagesTableArray.push("INSERT INTO MessagesTable (message_id, contents, sender, chan_link_id) VALUES (DEFAULT, ?, ?, ?)", [val.contents, val.sender, val.chan_link_id])
  });


  return Promise.all(MessagesTableArray);
})
.then((results) => {

  UserInChannelData.forEach((val) => {
    UserInChannelArray.push("INSERT INTO UserInChannel (inchan_id, inchan_userid, inchan_channel_id) VALUES (DEFAULT, ?, ?)", [val.inchan_userid, val.inchan_channel_id]);
  });

  return Promise.all(UserInChannelArray);
})
.then(() => {
  PrivateMessagesData.forEach((val) => {
    PrivateMessagesArray.push("INSERT INTO PrivateMessages (pm_id, pm_from, pm_to, pm_message, pm_date) VALUES (DEFAULT, ? ,? ,? ,?)", [val.pm_from, val.pm_to, val.pm_message, val.pm_date]);
  });

  return Promise.all(PrivateMessagesArray);
})
.then((results) => {
  console.log("DATABASE has been deleted and created!");
})
.catch((e) => {
  throw e;
});
*/

const mysql = require('promise-mysql');
let connection;

const ut_create_query = `CREATE TABLE IF NOT EXISTS UserTable (
user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
username VARCHAR(32) BINARY NOT NULL UNIQUE,
password VARCHAR (128) NOT NULL,
salt VARCHAR (32) NOT NULL,
image VARCHAR (500) NOT NULL,
PRIMARY KEY (user_id));`;



// Query to create Channels table
const ct_create_query = `CREATE TABLE IF NOT EXISTS ChannelsTable (
chan_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
chan_name VARCHAR(64) NOT NULL UNIQUE,
PRIMARY KEY (chan_id));`;

// Query to create Messages table
const mt_create_query = `CREATE TABLE IF NOT EXISTS MessagesTable (
message_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
contents VARCHAR(256) NOT NULL,
sender VARCHAR(32) NOT NULL,
chan_link_id INT UNSIGNED NOT NULL,
message_date BIGINT(20) UNSIGNED NOT NULL,
PRIMARY KEY (message_id));`;

const uic_create_query = `CREATE TABLE IF NOT EXISTS UserInChannel (
  inchan_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  inchan_userid INT UNSIGNED NOT NULL,
  inchan_channel_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (inchan_id));`;

const pm_create_query =   `CREATE TABLE IF NOT EXISTS PrivateMessages (
  pm_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pm_from INT UNSIGNED NOT NULL,
  pm_to INT UNSIGNED NOT NULL,
  pm_message VARCHAR(256) NOT NULL,
  pm_date DATETIME NOT NULL,
  PRIMARY KEY (pm_id)
)`

const createTableArray = [ut_create_query, ct_create_query, mt_create_query, uic_create_query, pm_create_query];



mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
}).then((conn) => {
  connection = conn;
  return connection.query("DROP DATABASE IF EXISTS chatdb")
})
.then((results) => {
  return connection.query("CREATE DATABASE chatdb")
})
.then((results) => {
  connection.end();
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatdb",
  });
})
.then((conn) => {
  connection = conn;
  const createTablePromises = [];

  createTableArray.forEach((val) => {
    createTablePromises.push(connection.query(val));
  });

  return Promise.all(createTablePromises);
})
.then((results) => {
  return connection.query("INSERT INTO ChannelsTable (chan_id, chan_name) VALUES (DEFAULT, 'general')");
})
.then((results) => {
  console.log("DATABASE has been deleted and created!");
})
.catch((e) => {
  throw e;
});
