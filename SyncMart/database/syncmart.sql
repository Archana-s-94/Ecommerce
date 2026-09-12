-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 12, 2026 at 03:28 AM
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
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(5, 1, 5550.00, 'Pending', '2026-08-31 04:33:15'),
(6, 13, 1900.00, 'Pending', '2026-09-09 08:27:03'),
(7, 15, 3550.00, 'Pending', '2026-09-09 09:33:27'),
(8, 13, 2800.00, 'Pending', '2026-09-10 04:38:02'),
(9, 13, 30520.00, 'Pending', '2026-09-10 05:33:31'),
(10, 13, 1900.00, 'Pending', '2026-09-10 05:36:09'),
(11, 13, 3200.00, 'Pending', '2026-09-10 05:43:54'),
(12, 13, 6600.00, 'Pending', '2026-09-10 05:53:03'),
(13, 15, 5000.00, 'Delivered', '2026-09-10 06:14:01'),
(14, 13, 2850.00, 'Pending', '2026-09-10 09:04:22'),
(15, 15, 1650.00, 'Pending', '2026-09-10 09:07:15'),
(16, 15, 1650.00, 'Shipped', '2026-09-10 21:07:03'),
(17, 13, 3800.00, 'Pending', '2026-09-10 21:20:43'),
(18, 13, 1100.00, 'Pending', '2026-09-10 21:22:22'),
(19, 15, 2300.00, 'Pending', '2026-09-10 21:26:39'),
(20, 15, 1100.00, 'Pending', '2026-09-10 21:33:31'),
(21, 15, 1650.00, 'Processing', '2026-09-10 21:44:42'),
(22, 13, 4950.00, 'Pending', '2026-09-11 20:09:08'),
(23, 13, 2250.00, 'Pending', '2026-09-12 01:05:05');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(1, 11, 5, 1, 1550.00, '2026-09-10 05:43:54'),
(2, 11, 3, 1, 1650.00, '2026-09-10 05:43:54'),
(3, 12, 3, 4, 1650.00, '2026-09-10 05:53:03'),
(4, 13, 5, 2, 1550.00, '2026-09-10 06:14:01'),
(5, 13, 26, 1, 1900.00, '2026-09-10 06:14:01'),
(6, 14, 3, 1, 1650.00, '2026-09-10 09:04:22'),
(7, 14, 12, 1, 1200.00, '2026-09-10 09:04:22'),
(8, 15, 3, 1, 1650.00, '2026-09-10 09:07:15'),
(9, 16, 30, 1, 1650.00, '2026-09-10 21:07:03'),
(10, 17, 2, 2, 1900.00, '2026-09-10 21:20:43'),
(11, 18, 13, 1, 1100.00, '2026-09-10 21:22:22'),
(12, 19, 7, 1, 1500.00, '2026-09-10 21:26:39'),
(13, 19, 17, 1, 800.00, '2026-09-10 21:26:39'),
(14, 20, 13, 1, 1100.00, '2026-09-10 21:33:31'),
(15, 21, 3, 1, 1650.00, '2026-09-10 21:44:42'),
(16, 22, 3, 3, 1650.00, '2026-09-11 20:09:08'),
(17, 23, 3, 1, 1650.00, '2026-09-12 01:05:05'),
(18, 23, 25, 1, 600.00, '2026-09-12 01:05:05');

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
(3, 1, 'iphone 15', 'Apple', 'iOS', 1650.00, 2, 'iphone15.jpg', '6GB', '256GB', 'A16 Bionic', 'iOS 17', 'Apple Smartphone'),
(5, 1, 'iphone 15 Pro', 'Apple', 'iOS', 1550.00, 8, 'iphone15.jpg', '8GB', '256GB', 'A16 Bionic', 'iOS 17', 'Apple Smartphone'),
(6, 1, 'iphone 14', 'Apple', 'iOS', 1500.00, 9, 'iphone14.jpg', '6GB', '256GB', 'A15 Bionic', 'iOS 16', 'Apple Smartphone'),
(7, 1, 'iphone 14 Pro', 'Apple', 'iOS', 1500.00, 5, 'iphone14.jpg', '8GB', '256GB', 'A15 Bionic', 'iOS 16', 'Apple Smartphone\r\n'),
(8, 1, 'iphone 13', 'Apple', 'iOS', 1450.00, 9, 'iphone13.jpg', '6GB', '256GB', 'A15 Bionic', 'iOS 15', 'Apple Smartphone'),
(9, 1, 'iphone 13 Pro', 'Apple', 'iOS', 1400.00, 5, 'iphone13.jpg', '6GB', '256GB', 'A15 Bionic', 'iOS 15', 'Apple Smartphone\r\n'),
(10, 1, 'iphone 12', 'Apple', 'iOS', 1350.00, 4, 'iphone12.jpg', '6GB', '256GB', 'A14 Bionic', 'iOS 14', 'Apple Smartphone'),
(11, 1, 'iphone 12 Pro', 'Apple', 'iOS', 1250.00, 6, 'iphone12.jpg', '8GB', '256GB', 'A14 Bionic', 'iOS 14', 'Apple Smartphone'),
(12, 1, 'iphone 11', 'Apple', 'iOS', 1200.00, 2, 'iphone11.jpg', '6GB', '256GB', 'A13 Bionic', 'iOS 13', 'Apple Smartphone'),
(13, 1, 'iphone 11 Pro', 'Apple', 'iOS', 1100.00, 0, 'iphone11.jpg', '8GB', '256GB', 'A13 Bionic', 'iOS 13', 'Apple Smartphone'),
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
(25, 2, 'HP Notebook', 'HP', 'Notebook', 600.00, 2, 'hp.jpg', '6GB', '128GB', 'Intel Core i5 7200U 2.5GHz', 'No OS', 'HP notebook'),
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
  `contact` varchar(25) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'customer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `contact`, `role`) VALUES
(1, 'Tester1', 'tester1@gmail.com', 'Tester123', '123456789', 'customer'),
(2, 'Tester2', 'tester2@gmail.com', 'Tester123', '123456789', 'customer'),
(3, 'Tester3', 'Tester3@gmail.com', 'Tester123', '123456789', 'customer'),
(4, 'Tester4', 'tester4@gmail.com', 'Tester123', '123456789', 'customer'),
(5, 'Tester5', 'tester5@gmail.com', 'Tester123', '123456789', 'customer'),
(6, 'Tester6', 'tester6@gmail.com', 'Tester123', '123456789', 'customer'),
(7, 'Tester7', 'tester7@gmail.com', 'Tester123', '123456789', 'customer'),
(8, 'Tester8', 'tester8@gmail.com', 'Tester123', '123456789', 'customer'),
(9, 'Tester9', 'tester9@gmail.com', 'Tester123', '123456789', 'customer'),
(10, 'Tester10', 'tester10@gmail.com', 'Tester123', '123456789', 'customer'),
(11, 'Tester11', 'tester11@gmail.com', 'Tester123', '1234567890', 'customer'),
(12, 'Tester13', 'tester13@gmail.com', 'Tester123', '123456789', 'customer'),
(13, 'Archana', 'archana@gmail.com', '$2b$10$yMBXdH/KHPOtRM8M8y7leOwHISpHrsTx4QNk2lEbDPXV0NRRvXaki', '1234567890', 'admin'),
(14, 'Mom', 'mom@gmail.com', '$2b$10$EyKGTXnoZ0noFd91lHwdtu4FyMuDV6JktzJPSE0ugVw/jqXrL/2T2', '1234567890', 'customer'),
(15, 'Tom Smith', 'tom@gmail.com', '$2b$10$mV6CTotUQuAP5mVWa0Y7eO/kCmqDQACEFXfrgCU9WIjExVNxalMwW', '1234567890', 'customer');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(4, 15, 3, '2026-09-10 06:15:09'),
(5, 15, 16, '2026-09-10 21:05:38'),
(6, 15, 35, '2026-09-10 21:05:47'),
(7, 13, 2, '2026-09-11 20:09:20'),
(8, 13, 27, '2026-09-12 01:04:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

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
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist_item` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
