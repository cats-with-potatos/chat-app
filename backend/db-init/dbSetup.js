const mysql = require('promise-mysql');
let connection;

const ut_create_query = `CREATE TABLE IF NOT EXISTS UserTable (
user_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
username VARCHAR(32) BINARY NOT NULL UNIQUE,
password VARCHAR (128) NOT NULL,
salt VARCHAR (32) NOT NULL,
PRIMARY KEY (user_id));`;

// Query to create Channels table
const ct_create_query = `CREATE TABLE IF NOT EXISTS ChannelsTable (
chan_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
chan_name VARCHAR(64) NOT NULL UNIQUE,
PRIMARY KEY (chan_id));`;

// Query to create Messages table
const mt_create_query = `CREATE TABLE IF NOT EXISTS MessagesTable (
message_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
contents VARCHAR(256) NOT NULL,
sender VARCHAR(32) NOT NULL,
chan_link_id TINYINT UNSIGNED NOT NULL,
PRIMARY KEY (message_id));`;

const uic_create_query = `CREATE TABLE IF NOT EXISTS UserInChannel (
  inchan_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  inchan_userid TINYINT UNSIGNED NOT NULL,
  inchan_channel_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (inchan_id));`;

const createTableArray = [ut_create_query, ct_create_query, mt_create_query, uic_create_query];



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
