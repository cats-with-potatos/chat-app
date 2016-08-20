<?php

// Initializing DB login variables -- compliant with the login information decided on by the team
$database_host = 'localhost';
$database_uname = 'root';
$database_pword = '';
$database_name = 'chatdb';

// Establishing a connection to the MySQL database
$connection = new mysqli($database_host, $database_uname, $database_pword, $database_name);

// Query to drop database
$drop_query = "DROP DATABASE chatdb;";

// Enact query
$result = $connection -> query($drop_query);

// Ensure there are no errors associated with the query
if (!$result)
{
    die($connection -> connect_error);
}

else
{
    die("DATABASE SUCCESSFULLY DROPPED");
}

