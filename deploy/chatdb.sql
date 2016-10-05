-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 02, 2016 at 07:47 AM
-- Server version: 10.1.13-MariaDB
-- PHP Version: 5.5.37

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chatdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `ChannelsTable`
--

CREATE TABLE `ChannelsTable` (
  `chan_id` tinyint(3) UNSIGNED NOT NULL,
  `chan_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `MessagesTable`
--

CREATE TABLE `MessagesTable` (
  `message_id` mediumint(8) UNSIGNED NOT NULL,
  `contents` varchar(256) NOT NULL,
  `sender` varchar(32) NOT NULL,
  `chan_link_id` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `UserInChannel`
--

CREATE TABLE `UserInChannel` (
  `inchan_id` tinyint(3) UNSIGNED NOT NULL,
  `inchan_userid` tinyint(3) UNSIGNED NOT NULL,
  `inchan_channel_id` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `UserTable`
--

CREATE TABLE `UserTable` (
  `user_id` tinyint(3) UNSIGNED NOT NULL,
  `username` varchar(32) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `password` varchar(128) NOT NULL,
  `salt` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ChannelsTable`
--
ALTER TABLE `ChannelsTable`
  ADD PRIMARY KEY (`chan_id`),
  ADD UNIQUE KEY `chan_name` (`chan_name`);

--
-- Indexes for table `MessagesTable`
--
ALTER TABLE `MessagesTable`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `UserInChannel`
--
ALTER TABLE `UserInChannel`
  ADD PRIMARY KEY (`inchan_id`);

--
-- Indexes for table `UserTable`
--
ALTER TABLE `UserTable`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ChannelsTable`
--
ALTER TABLE `ChannelsTable`
  MODIFY `chan_id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `MessagesTable`
--
ALTER TABLE `MessagesTable`
  MODIFY `message_id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=894;
--
-- AUTO_INCREMENT for table `UserInChannel`
--
ALTER TABLE `UserInChannel`
  MODIFY `inchan_id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
--
-- AUTO_INCREMENT for table `UserTable`
--
ALTER TABLE `UserTable`
  MODIFY `user_id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
