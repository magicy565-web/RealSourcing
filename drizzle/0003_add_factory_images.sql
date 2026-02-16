-- 创建factory_images表用于存储工厂和产品图片
CREATE TABLE IF NOT EXISTS `factory_images` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `factoryId` int NOT NULL,
  `url` varchar(500) NOT NULL,
  `type` enum('factory', 'product', 'certification') NOT NULL DEFAULT 'factory',
  `category` varchar(50),
  `displayOrder` int DEFAULT 0,
  `isPrimary` tinyint DEFAULT 0,
  `caption` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_factoryId` (`factoryId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_displayOrder` (`displayOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
