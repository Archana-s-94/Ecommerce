-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 31, 2026 at 06:34 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `syncmart`
--

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--

CREATE TABLE `Categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Categories`
--

INSERT INTO `Categories` (`id`, `category_name`, `image`) VALUES
(1, 'Mobile', 'mobile.jpg'),
(2, 'Laptop', 'laptop.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `order_date`) VALUES
(1, 8, 950.00, 'Pending', '2026-08-19 08:10:18'),
(2, 8, 3700.00, 'Pending', '2026-08-19 08:15:32'),
(4, 8, 1700.00, 'Pending', '2026-08-26 06:22:48'),
(5, 1, 5550.00, 'Pending', '2026-08-31 04:33:15');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `ram` varchar(50) DEFAULT NULL,
  `storage` varchar(50) DEFAULT NULL,
  `processor` varchar(100) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `brand`, `model`, `price`, `stock`, `image`, `ram`, `storage`, `processor`, `os`, `description`) VALUES
(1, 1, 'iphone 16', 'Apple', 'iOS', 1700.00, 10, 'iphone16.jpg', '6GB', '256GB', 'A17 Bionic', 'iOS 18', 'Apple Smartphone'),
(2, 1, 'iphone 16 Pro', 'Apple', 'iOS', 1900.00, 15, 'iphone16.jpg', '8GB', '256GB', 'A17 Pro', 'iOS 18', 'Apple Smartphone'),
(3, 1, 'iphone 15', 'Apple', 'iOS', 1650.00, 7, 'iphone15.jpg', '6GB', '256GB', 'A16 Bionic', 'iOS 17', 'Apple Smartphone'),
(5, 1, 'iphone 15 Pro', 'Apple', 'iOS', 1550.00, 8, 'iphone15.jpg', '8GB', '256GB', 'A16 Bionic', 'iOS 17', 'Apple Smartphone'),
(6, 1, 'iphone 14', 'Apple', 'iOS', 1500.00, 9, 'iphone14.jpg', '6GB', '256GB', 'A15 Bionic', 'iOS 16', 'Apple Smartphone'),
(7, 1, 'iphone 14 Pro', 'Apple', 'iOS', 1500.00, 5, 'iphone14.jpg', '8GB', '256GB', 'A15 Bionic', 'iOS 16', 'Apple Smartphone\r\n'),
(8, 1, 'iphone 13', 'Apple', 'iOS', 1450.00, 9, 'iphone13.jpg', '6GB', '256GB', 'A15 Bionic', 'iOS 15', 'Apple Smartphone'),
(9, 1, 'iphone 13 Pro', 'Apple', 'iOS', 1400.00, 5, 'iphone13.jpg', '6GB', '256GB', 'A15 Bionic', 'iOS 15', 'Apple Smartphone\r\n'),
(10, 1, 'iphone 12', 'Apple', 'iOS', 1350.00, 4, 'iphone12.jpg', '6GB', '256GB', 'A14 Bionic', 'iOS 14', 'Apple Smartphone'),
(11, 1, 'iphone 12 Pro', 'Apple', 'iOS', 1250.00, 6, 'iphone12.jpg', '8GB', '256GB', 'A14 Bionic', 'iOS 14', 'Apple Smartphone'),
(12, 1, 'iphone 11', 'Apple', 'iOS', 1200.00, 2, 'iphone11.jpg', '6GB', '256GB', 'A13 Bionic', 'iOS 13', 'Apple Smartphone'),
(13, 1, 'iphone 11 Pro', 'Apple', 'iOS', 1100.00, 1, 'iphone11.jpg', '8GB', '256GB', 'A13 Bionic', 'iOS 13', 'Apple Smartphone'),
(14, 1, 'iphone 10', 'Apple', 'iOS', 1000.00, 4, 'iphone10.jpg', '6GB', '256GB', 'A12 Bionic', 'iOS 12', 'Apple Smartphone'),
(15, 1, 'iphone 10 Pro', 'Apple', 'iOS', 950.00, 4, 'iphone10.jpg', '8GB', '256GB', 'A12 Bionic', 'iOS 12', 'Apple Smartphone'),
(16, 1, 'iphone XE', 'Apple', 'iOS', 850.00, 4, 'iphoneXE.jpg', '6GB', '256GB', 'A12 Bionic', 'iOS 10', 'Apple Smartphone'),
(17, 1, 'iphone XS', 'Apple', 'iOS', 800.00, 1, 'iphoneXS.jpg', '8GB', '256GB', 'A12z Bionic', 'iOS 8', 'Apple Smartphone'),
(18, 1, 'Samsung Galaxy S24 Ultra', 'Samsung', 's24', 2000.00, 11, 'samsungS24Ultra.jpg', '8GB', '256GB', 'Exynos 2400', 'Android', 'Android Smartphone'),
(19, 1, 'Samsung Galaxy S24', 'Samsung', 'S24', 1900.00, 6, 'samsungS24.jpg', '8GB', '256GB', 'Exynos 2400', 'Android', 'Android Smartphone'),
(20, 1, 'Samsung Galaxy S23', 'Samsung', 'S23', 1800.00, 7, 'samsungS23.jpg', '8GB', '256GB', 'Snapdragon 8 Gen 2', 'Android', 'Android Smartphone'),
(21, 1, 'Samsung Galaxy S23 Ultra', 'Samsung', 'S23', 1700.00, 4, 'samsungS23.jpg', '8GB', '256GB', 'Snapdragon 8 Gen 2', 'Android', 'Android Smartphone'),
(22, 1, 'Samsung Galaxy S22 Ultra', 'Samsung', 'S22', 1600.00, 4, 'samsungS22.jpg', '6GB', '256GB', 'Exynos 2200', 'Android', 'Android Smartphone'),
(23, 1, 'Samsung Galaxy S22', 'Samsung', 'S22', 1650.00, 8, 'samsungS22.jpg', '8GB', '256GB', 'Exynos 2200', 'Android', 'Android Smartphone'),
(24, 2, 'Apple Ultrabook', 'Apple', 'Ultrabook', 1400.00, 10, 'apple.jpg', '8GB', '128GB', 'Intel Iris Plus Graphics 640', 'macOS', 'Apple Laptop'),
(25, 2, 'HP Notebook', 'HP', 'Notebook', 600.00, 3, 'hp.jpg', '6GB', '128GB', 'Intel Core i5 7200U 2.5GHz', 'No OS', 'HP notebook'),
(26, 2, 'Acer Notebook', 'Acer', 'Notebook', 1900.00, 7, 'acer.jpg', '6GB', '256GB', 'AMD A9-Series 9420 3GHz', 'Windows 10', 'Acer Notebook'),
(27, 2, 'Dell Notebook', 'Dell', 'Notebook', 900.00, 6, 'dell.jpg', '6GB', '256GB', 'Intel Core i3 6006U 2GHz', 'Windows 10', 'Dell Notebook'),
(28, 2, 'Lenovo Notebook', 'Lenovo', 'Notebook', 1300.00, 5, 'lenovo.jpg', '6GB', '128GB', 'Intel Core i3 7100U 2.4GHz', 'No OS', 'Lenovo Notebook'),
(29, 2, 'Asus Netbook', 'Asus', 'Netbook', 1400.00, 3, 'asus.jpg', '8GB', '256GB', 'AMD E-Series E2-6110 1.5GHz', 'Windows 10', 'Asus Netbook'),
(30, 2, 'Chuwi Notebook', 'Chuwi', 'Notebook', 1650.00, 1, 'chuwi.jpg', '6GB', '128GB', 'Intel Atom x5-Z8300 1.44GHz', 'Windows 10', 'Chuwi Notebook'),
(31, 2, 'MSI Gaming', 'MSI', 'Gaming', 2600.00, 8, 'msi.jpg', '8GB', '256GB', 'Intel Core i7 7700HQ 2.8GHz', 'Linux', 'MSI Gaming'),
(32, 2, 'Microsoft Ultrabook', 'Microsoft ', 'Ultrabook', 1550.00, 1, 'microsoft.jpg', '6GB', '128GB', 'Intel Core i5 7200U 2.5GHz', 'Windows 10 S', 'Microsoft ultrabook'),
(33, 2, 'Huawei Ultrabook', 'Huawei', 'Ultrabook', 1970.00, 6, 'huawei.jpg', '8GB', '256GB', 'Intel Core i5 7200U 2.5GHz', 'Windows 10', 'Huawei Ultrabook'),
(34, 2, 'Xiaomi Notebook', 'Xiaomi', 'Notebook', 1400.00, 4, 'xiaomi.jpg', '8GB', '256GB', 'Intel Core i5 8250U 1.6GHz', 'No OS', 'Xiaomi Notebook'),
(35, 2, 'Toshiba Notebook', 'Toshiba', 'Notebook', 1230.00, 8, 'toshiba.jpg', '6GB', '128GB', 'Intel Core i5 7200U 2.5GHz', 'Windows 10', 'Toshiba Notebook');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `contact` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `contact`) VALUES
(1, 'Tester1', 'tester1@gmail.com', 'Tester123', '123456789'),
(2, 'Tester2', 'tester2@gmail.com', 'Tester123', '123456789'),
(3, 'Tester3', 'Tester3@gmail.com', 'Tester123', '123456789'),
(4, 'Tester4', 'tester4@gmail.com', 'Tester123', '123456789'),
(5, 'Tester5', 'tester5@gmail.com', 'Tester123', '123456789'),
(6, 'Tester6', 'tester6@gmail.com', 'Tester123', '123456789'),
(7, 'Tester7', 'tester7@gmail.com', 'Tester123', '123456789'),
(8, 'Tester8', 'tester8@gmail.com', 'Tester123', '123456789'),
(9, 'Tester9', 'tester9@gmail.com', 'Tester123', '123456789'),
(10, 'Tester10', 'tester10@gmail.com', 'Tester123', '123456789'),
(11, 'Tester11', 'tester11@gmail.com', 'Tester123', '1234567890');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
