<?php

$database_host = 'localhost';
$database_uname = 'root';
$database_pword = '';

$connection = new mysqli($database_host, $database_uname, $database_pword);

if ($connection -> connect_error)
{
    die($connection -> connect_error);
}

$db_create_query = "CREATE DATABASE IF NOT EXISTS chatdb;";

$result = $connection -> query($db_create_query);

if (!$result)
{
    die($connection -> connect_error);
}
else
{
    mysqli_close($connection);
    $database_name = 'chatdb';
    $connection = new mysqli($database_host, $database_uname, $database_pword, $database_name);
}

$ut_create_query = "CREATE TABLE IF NOT EXISTS UserTable (
user_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
username VARCHAR(32) NOT NULL UNIQUE,
password VARCHAR (128) NOT NULL,
salt VARCHAR (32) NOT NULL,
PRIMARY KEY (user_id));";

$ct_create_query = "CREATE TABLE IF NOT EXISTS ChannelsTable (
chan_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
chan_name VARCHAR(64) NOT NULL UNIQUE,
PRIMARY KEY (chan_id));";

$mt_create_query = "CREATE TABLE IF NOT EXISTS MessagesTable (
message_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
contents VARCHAR(256),
sender VARCHAR(32),
chan_link_id TINYINT UNSIGNED,
PRIMARY KEY (message_id));";

$query_array = array($ut_create_query, $ct_create_query, $mt_create_query);

foreach ($query_array as $item)
{
    $result = $connection -> query($item);

    if (!$result)
    {
        die($connection -> connect_error);
    }

}

die("SCHEMA SUCCESSFULLY BUILT");
