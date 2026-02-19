-- Migration: Add webinar_products table
-- Created: 2026-02-19
-- Purpose: Enable linking products to webinars for product showcase functionality

CREATE TABLE IF NOT EXISTS `webinar_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `webinarId` INT NOT NULL,
  `productId` INT NOT NULL,
  `displayOrder` INT DEFAULT 0,
  `featured` TINYINT DEFAULT 0,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_webinarId` (`webinarId`),
  INDEX `idx_productId` (`productId`),
  UNIQUE KEY `unique_webinar_product` (`webinarId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
