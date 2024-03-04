-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 01, 2024 at 02:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Users`
--

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(225) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'user1', 'user1@gmail.com', '$2b$10$T8h1gY6GxlePLjxxjCcKQOtzVCZNp2iQvu4kQ47ISIVcdiSzY.gaa', '2024-03-01 11:34:08', NULL),
(2, 'user2', 'user2@gmail.com', '$2b$10$hiLcUy39hRyMAI74v/Lc0.1l/SWQ6nW4kzk/coxZno0YZJRLClUgu', '2024-03-01 11:35:20', '2024-03-01 11:35:53'),
(3, 'user3', 'user3@gmail.com', '$2b$10$Lgh2QwWPy9Gf5mg41qvO2uimMEtyxH3nrIAEtpLE5b5kiM8qMdpSe', '2024-03-01 13:25:16', NULL),
(4, 'user4', 'user4@gmail.com', '$2b$10$X9GrznJmEpfgVs53EFUjd.JKrxIlhDMXjW5SaBllOKb0N94MA9TWa', '2024-03-01 14:33:29', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
