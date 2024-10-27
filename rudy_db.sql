-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 26, 2024 at 05:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rudy_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `apis`
--

CREATE TABLE `apis` (
  `id` int(11) NOT NULL,
  `api_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `base_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apis`
--

INSERT INTO `apis` (`id`, `api_name`, `username`, `password`, `base_url`) VALUES
(1, 'Basic I', 'TestH', 'TestHub123', 'http://link:1337/launch'),
(2, 'Basic II', 'TestH2', 'TestHub1232', 'http://link:1337/launch'),
(3, 'Basic III', 'TestH3', 'TestHub1233', 'http://link:1337/launch'),
(4, 'Premium I', 'TestH4', 'TestHub1234', 'http://link:1337/launch'),
(5, 'Premium II', 'TestH5', 'TestHub1235', 'http://link:1337/launch'),
(6, 'Premium III', 'TestH6', 'TestHub1236', 'http://link:1337/launch'),
(7, 'Platinum I', 'TestH7', 'TestHub1237', 'http://link:1337/launch'),
(8, 'Platinum II', 'TestH8', 'TestHub1238', 'http://link:1337/launch'),
(9, 'Platinum III', 'TestH9', 'TestHub1239', 'http://link:1337/launch'),
(15, 'Free Plan', 'TestHub1', 'TestHubKurac19', 'http://link:1337/launch');

-- --------------------------------------------------------

--
-- Table structure for table `attacks`
--

CREATE TABLE `attacks` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `host` varchar(255) NOT NULL,
  `port` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `method` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT NULL,
  `last_attack_ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attacks`
--

INSERT INTO `attacks` (`id`, `username`, `host`, `port`, `time`, `method`, `timestamp`, `last_attack_ip`) VALUES
(1, 'ivkeboyara', '51.254.139.153', 7777, 30, 'UDP-SAMP', '2024-08-23 22:51:41', '::1');

-- --------------------------------------------------------

--
-- Table structure for table `banned_ips`
--

CREATE TABLE `banned_ips` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `banned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ban_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banned_users`
--

CREATE TABLE `banned_users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `ban_reason` text DEFAULT NULL,
  `banned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blacklist`
--

CREATE TABLE `blacklist` (
  `id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blacklist`
--

INSERT INTO `blacklist` (`id`, `url`) VALUES
(2, 'https://link.xyz/');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `plan_price` decimal(10,2) NOT NULL,
  `plan_duration` int(11) NOT NULL,
  `power` varchar(50) NOT NULL,
  `time` varchar(50) NOT NULL,
  `vip_network` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `plan_name`, `plan_price`, `plan_duration`, `power`, `time`, `vip_network`) VALUES
(1, 'Basic I', 8.00, 30, '10Gb/s', '60sec', 0),
(2, 'Basic II', 30.00, 30, '35Gb/s', '60sec', 0),
(3, 'Basic III', 35.00, 30, '35Gb/s', '100sec', 0),
(4, 'Premium I', 50.00, 30, '40Gb/s', '15sec', 0),
(5, 'Premium II', 55.00, 30, '45Gb/s', '120sec', 1),
(6, 'Premium III', 70.00, 30, '60Gb/s', '150sec', 1),
(7, 'Platinum I', 90.00, 30, '100Gb/s', '120sec', 2),
(8, 'Platinum II', 110.00, 30, '120Gb/s', '150sec', 2),
(9, 'Platinum III', 130.00, 30, '200Gb/s', '200sec', 2),
(10, 'Free Plan', 0.00, 30, '1Gb/s', '120sec', 0);

-- --------------------------------------------------------

--
-- Table structure for table `port_blacklist`
--

CREATE TABLE `port_blacklist` (
  `id` int(11) NOT NULL,
  `port` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `port_blacklist`
--

INSERT INTO `port_blacklist` (`id`, `port`, `created_at`) VALUES
(1, 19999, '2024-10-20 07:56:52');

-- --------------------------------------------------------

--
-- Table structure for table `redeem_codes`
--

CREATE TABLE `redeem_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `used_by` varchar(255) DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `redeem_codes`
--

INSERT INTO `redeem_codes` (`id`, `code`, `plan_name`, `used_by`, `used_at`, `created_at`) VALUES
(3, '6IDZLUR3-TLN6EAY9', 'Premium III', 'ivkeboyara', '2024-08-13 11:26:58', '2024-08-12 22:01:59'),
(4, 'Y8B55JCL-S2QJPYQY', 'Premium I', 'ivkeboyara', '2024-08-13 11:16:20', '2024-08-13 11:16:01'),
(5, 'SQKB4M2Z-Z7DJVY8G', 'Platinum III', 'ivkeboyara', '2024-08-13 12:33:16', '2024-08-13 12:32:31'),
(6, 'ZWDRVZRU-XD3UQ8M7', 'Basic I', NULL, NULL, '2024-10-22 21:17:15');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_name` varchar(255) NOT NULL,
  `setting_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_name`, `setting_value`) VALUES
(1, 'totalServers', '22');

-- --------------------------------------------------------

--
-- Table structure for table `slots`
--

CREATE TABLE `slots` (
  `id` int(11) NOT NULL,
  `method` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `max_slots` int(11) NOT NULL,
  `active_slots` int(11) DEFAULT 0,
  `last_reset` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `vip_methods` tinyint(1) NOT NULL DEFAULT 0,
  `layer` tinyint(1) NOT NULL DEFAULT 4
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `slots`
--

INSERT INTO `slots` (`id`, `method`, `category`, `max_slots`, `active_slots`, `last_reset`, `vip_methods`, `layer`) VALUES
(1, 'AMP', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(2, 'DNS', 'AMP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(3, 'UDP', 'UDP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(6, 'TCP', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(7, 'SYN', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(8, 'ACK', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(9, 'MIXv1.0', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(10, 'HANDSHAKE', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(11, 'OVHKILL', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(12, 'HTTPS', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(13, 'TLS', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(14, 'RESET', 'L7', 1, 1, '2024-10-20 08:11:41', 0, 7),
(15, 'HTTP-Q(HTTP-DDoS)', '', 0, 1, '2024-10-20 08:11:41', 0, 4),
(16, 'BROWSER', 'L7', 1, 1, '2024-10-20 08:11:41', 1, 7),
(17, 'HTTP-ICE', 'L7', 1, 1, '2024-10-20 08:11:41', 0, 7),
(29, 'UDP-BYPASS', 'UDP', 1, 1, '2024-10-20 08:11:41', 1, 4),
(30, 'UDP-VSE', 'UDP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(31, 'UDP-RAW', 'UDP', 1, 1, '2024-10-20 08:11:41', 1, 4),
(32, 'SADP', 'AMP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(33, 'WSD', 'AMP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(34, 'UDP-PPS', 'UDP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(35, 'HOME', 'AMP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(36, 'OVH-KILL', 'TCP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(37, 'TCP-BYPASS', 'TCP', 1, 1, '2024-10-20 08:11:41', 1, 4),
(38, 'TCP-ACK', 'TCP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(39, 'TCP-SYN', 'TCP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(40, 'TCP-RAW', 'TCP', 1, 1, '2024-10-20 08:11:41', 1, 4),
(41, 'TCP-MIX', 'TCP', 1, 1, '2024-10-20 08:11:41', 0, 4),
(42, 'TCP-TFO', 'TCP', 1, 1, '2024-10-20 08:11:41', 1, 4),
(43, 'DISCORD', 'SPECIAL', 1, 1, '2024-10-20 08:11:41', 1, 4),
(44, 'UDP-WARZONE', 'GAME', 1, 1, '2024-10-20 08:11:41', 1, 4),
(45, 'UDP-R6', 'GAME', 1, 1, '2024-10-20 08:11:41', 0, 4),
(46, 'UDP-DAYZ', 'GAME', 1, 1, '2024-10-20 08:11:41', 0, 4),
(47, 'UDP-FORTNITE', 'GAME', 1, 1, '2024-10-20 08:11:41', 0, 4),
(48, 'UDP-SAMP', 'GAME', 1, 0, '2024-10-20 08:11:41', 0, 4),
(49, 'UDP-PUBG', 'GAME', 1, 1, '2024-10-20 08:11:41', 1, 4),
(50, 'UDP-FIVEMv1', 'GAME', 1, 1, '2024-10-20 08:11:41', 0, 4),
(51, 'UDP-FIVEMv2', 'GAME', 1, 1, '2024-10-20 08:11:41', 1, 4),
(52, 'CLOUDFLARE', 'L7', 1, 1, '2024-10-20 08:11:41', 0, 7),
(53, 'HTTP-DDOS', 'L7', 1, 0, '2024-10-20 08:11:41', 1, 7),
(54, 'TLS-KILL', 'L7', 1, 1, '2024-10-20 08:11:41', 0, 7),
(55, 'QUERY-FLOOD', 'L7', 1, 1, '2024-10-20 08:11:41', 1, 7),
(57, 'FREE-DNS', 'AMP', 5, 0, '2024-10-20 08:11:41', 0, 4),
(58, 'FREE-TLS', 'L7', 5, 0, '2024-10-20 08:11:41', 0, 7),
(60, 'FREE-SYN', 'AMP', 5, 0, '2024-10-20 08:11:41', 0, 4),
(61, 'HTTP-JUICE', 'L7', 1, 1, '2024-10-20 08:11:41', 1, 7),
(64, 'UDP-CS1.6', 'GAME', 1, 1, '2024-10-20 08:11:41', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `isAdmin` tinyint(1) DEFAULT 0,
  `plan` varchar(50) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `lastAttackTime` datetime DEFAULT NULL,
  `totalAttacks` int(11) DEFAULT 0,
  `joined_at` datetime DEFAULT current_timestamp(),
  `isPromoter` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `balance`, `isAdmin`, `plan`, `expires_at`, `lastAttackTime`, `totalAttacks`, `joined_at`, `isPromoter`) VALUES
(1, 'ivkeboyara', '$2b$10$UuXlr0FHGPwIADqEpoS6V.Nkj8cjVW4WUB7U2EqGrzqPY2YNWP3BW', 0.00, 1, 'Basic I', '2024-11-22 21:16:09', NULL, 0, '2024-10-19 09:43:19', 1),
(2, 'random mmk', '$2b$10$E4T8S5h7yKf0Dj8ZjKbF6OmdyUql3s5/t.YzZ1JjZ4XifZgB4B42y', 0.00, 0, 'basic', '2024-12-31 23:59:59', NULL, 0, '2024-10-22 21:09:04', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `apis`
--
ALTER TABLE `apis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attacks`
--
ALTER TABLE `attacks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `banned_ips`
--
ALTER TABLE `banned_ips`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `banned_users`
--
ALTER TABLE `banned_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `port_blacklist`
--
ALTER TABLE `port_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `port` (`port`);

--
-- Indexes for table `redeem_codes`
--
ALTER TABLE `redeem_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`);

--
-- Indexes for table `slots`
--
ALTER TABLE `slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `method` (`method`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `apis`
--
ALTER TABLE `apis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `attacks`
--
ALTER TABLE `attacks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT for table `banned_ips`
--
ALTER TABLE `banned_ips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `banned_users`
--
ALTER TABLE `banned_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blacklist`
--
ALTER TABLE `blacklist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `port_blacklist`
--
ALTER TABLE `port_blacklist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `redeem_codes`
--
ALTER TABLE `redeem_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `slots`
--
ALTER TABLE `slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
