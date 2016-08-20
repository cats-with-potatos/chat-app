<?php

// Initializing DB login variables -- compliant with the login information decided on by the team
$database_host = '127.0.0.1';
$database_uname = 'root';
$database_pword = '';

// Establishing a connection to the MySQL instance.
$connection = new mysqli($database_host, $database_uname, $database_pword);

// Ensure no connection errors.
if ($connection -> connect_error)
{
    die($connection -> connect_error);
}

// Assign SQL to a database creation variable, enact query
$db_create_query = "CREATE DATABASE IF NOT EXISTS chatdb;";
$result = $connection -> query($db_create_query);

// Ensure there is a result
if (!$result)
{
    die($connection -> connect_error);
}

else
{
    // Close old connection -- create connection using the newly created database
    mysqli_close($connection);
    $database_name = 'chatdb';
    $connection = new mysqli($database_host, $database_uname, $database_pword, $database_name);
}

// Query to create the Users table. Using unsigned integers for ids, as a negative ID should never occur for any reason
$ut_create_query = "CREATE TABLE IF NOT EXISTS UserTable (
user_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
username VARCHAR(32) NOT NULL UNIQUE,
password VARCHAR (128) NOT NULL,
salt VARCHAR (32) NOT NULL,
PRIMARY KEY (user_id));";

// Query to create Channels table
$ct_create_query = "CREATE TABLE IF NOT EXISTS ChannelsTable (
chan_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
chan_name VARCHAR(64) NOT NULL UNIQUE,
PRIMARY KEY (chan_id));";

// Query to create Messages table
$mt_create_query = "CREATE TABLE IF NOT EXISTS MessagesTable (
message_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
contents VARCHAR(256),
sender VARCHAR(32),
chan_link_id TINYINT UNSIGNED,
PRIMARY KEY (message_id));";

// MySQLi multi-query functionality is buggy at best. Workaround -- create an array of queries, an iterate over them, die if errors occur.
$query_array = array($ut_create_query, $ct_create_query, $mt_create_query);

// Iterating over each query in the array, dying if errors occur -- stops bad tables from being created.
foreach ($query_array as $item)
{
    $result = $connection -> query($item);

    if (!$result)
    {
        die($connection -> connect_error);
    }

}

die("SCHEMA SUCCESSFULLY BUILT");

