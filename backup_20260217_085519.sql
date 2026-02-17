mysqldump: [Warning] Using a password on the command line interface can be insecure.
Warning: A partial dump from a server that has GTIDs will by default include the GTIDs of all transactions, even those that changed suppressed parts of the database. If you don't want to restore GTIDs, pass --set-gtid-purged=OFF. To make a complete dump, pass --all-databases --triggers --routines --events. 
Warning: A dump from a server that has GTIDs enabled will by default include the GTIDs of all transactions, even those that were executed during its extraction and might not be represented in the dumped data. This might result in an inconsistent data dump. 
In order to ensure a consistent backup of the database, pass --single-transaction or --lock-all-tables or --master-data. 
-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: rm-bp1h4o9up7249uep3to.mysql.rds.aliyuncs.com    Database: realsourcing
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '9ef94262-0a1b-11f1-b5e6-1070fd72b1ae:1-48645';

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityType` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entityId` int DEFAULT NULL,
  `changes` json DEFAULT NULL,
  `ipAddress` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_action` (`action`),
  KEY `idx_entityType` (`entityType`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `webinarId` int NOT NULL COMMENT '会议ID',
  `userId` int DEFAULT NULL COMMENT '用户ID',
  `userName` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `userAvatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户头像',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `messageType` enum('text','image','file','system') COLLATE utf8mb4_unicode_ci DEFAULT 'text' COMMENT '消息类型',
  `isAi` tinyint(1) DEFAULT '0' COMMENT '是否AI消息',
  `metadata` json DEFAULT NULL COMMENT '元数据',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议聊天消息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factories`
--

DROP TABLE IF EXISTS `factories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legalName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coverImage` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subCategories` json DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'China',
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `postalCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `established` int DEFAULT NULL,
  `employees` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `annualRevenue` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exportRatio` int DEFAULT NULL,
  `mainMarkets` json DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `aiSummary` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','verified','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `verifiedAt` timestamp NULL DEFAULT NULL,
  `verifiedBy` int DEFAULT NULL,
  `overallScore` decimal(5,2) DEFAULT '0.00',
  `qualityScore` decimal(5,2) DEFAULT '0.00',
  `deliveryScore` decimal(5,2) DEFAULT '0.00',
  `communicationScore` decimal(5,2) DEFAULT '0.00',
  `pricingScore` decimal(5,2) DEFAULT '0.00',
  `complianceScore` decimal(5,2) DEFAULT '0.00',
  `reviewCount` int DEFAULT '0',
  `viewCount` int DEFAULT '0',
  `inquiryCount` int DEFAULT '0',
  `orderCount` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_userId` (`userId`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_overallScore` (`overallScore` DESC),
  KEY `idx_city` (`city`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `factories_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factories`
--

LOCK TABLES `factories` WRITE;
/*!40000 ALTER TABLE `factories` DISABLE KEYS */;
INSERT INTO `factories` VALUES (7,62,'Shenzhen Electronics Co., Ltd.','Shenzhen Electronics Co., Ltd.',NULL,'/logos/shenzhen-electronics.png',NULL,'Electronics',NULL,'China','Guangdong','Shenzhen','Shenzhen, Guangdong',NULL,'+86-755-8888-0001','export@szelectronics.cn',NULL,2008,'2500',NULL,NULL,NULL,'Leading manufacturer of consumer electronics and smart home devices with 15+ years of export experience.',NULL,'verified',NULL,NULL,92.00,90.00,90.00,92.00,93.00,90.00,2,90,0,9,'2026-02-16 08:50:51','2026-02-16 08:50:51',NULL),(8,62,'Guangzhou Smart Home Ltd.','Guangzhou Smart Home Ltd.',NULL,'/logos/guangzhou-smarthome.png',NULL,'Smart Home',NULL,'China','Guangdong','Guangzhou','Guangzhou, Guangdong',NULL,'+86-20-8888-0002','sales@gzsmarthome.cn',NULL,2015,'800',NULL,NULL,NULL,'Specializing in IoT-enabled home automation products including smart locks, sensors, and control systems.',NULL,'pending',NULL,NULL,88.00,88.00,89.00,90.00,86.00,87.00,3,100,0,10,'2026-02-16 08:50:51','2026-02-16 08:50:51',NULL),(9,62,'Dongguan Manufacturing Group','Dongguan Manufacturing Group',NULL,'/logos/dongguan-manufacturing.png',NULL,'Consumer Goods',NULL,'China','Guangdong','Dongguan','Dongguan, Guangdong',NULL,'+86-769-8888-0003','inquiry@dgmanufacturing.cn',NULL,2003,'3200',NULL,NULL,NULL,'Full-service OEM/ODM manufacturer for household products, kitchenware, and personal care items.',NULL,'pending',NULL,NULL,85.00,83.00,87.00,86.00,83.00,87.00,3,120,0,12,'2026-02-16 08:50:51','2026-02-16 08:50:51',NULL),(10,62,'Foshan Furniture Works','Foshan Furniture Works',NULL,'/logos/foshan-furniture.png',NULL,'Furniture',NULL,'China','Guangdong','Foshan','Foshan, Guangdong',NULL,'+86-757-8888-0004','export@foshanfurniture.cn',NULL,2010,'1500',NULL,NULL,NULL,'Premium furniture manufacturer specializing in modern office and home furniture with sustainable materials.',NULL,'pending',NULL,NULL,79.00,79.00,77.00,80.00,79.00,77.00,3,130,0,13,'2026-02-16 08:50:51','2026-02-16 08:50:51',NULL),(11,62,'Ningbo Textile Corp.','Ningbo Textile Corp.',NULL,'/logos/ningbo-textiles.png',NULL,'Textiles',NULL,'China','Zhejiang','Ningbo','Ningbo, Zhejiang',NULL,'+86-574-8888-0005','trade@nbtextile.cn',NULL,2001,'4000',NULL,NULL,NULL,'High-quality textile and garment manufacturer with advanced dyeing and printing capabilities.',NULL,'verified',NULL,NULL,91.00,90.00,92.00,89.00,89.00,90.00,5,170,0,17,'2026-02-16 08:50:51','2026-02-16 08:50:51',NULL),(12,62,'Shanghai Medical Tech','Shanghai Medical Tech',NULL,'/logos/shanghai-medical.png',NULL,'Medical Devices',NULL,'China','China','Shanghai','Shanghai, China',NULL,'+86-21-8888-0006','info@shanghaimedical.cn',NULL,2008,'1200',NULL,NULL,NULL,'High-tech medical device manufacturer specializing in diagnostic and surgical equipment.',NULL,'verified',NULL,NULL,94.00,92.00,92.00,96.00,92.00,96.00,5,190,0,19,'2026-02-16 08:50:51','2026-02-16 08:50:51',NULL),(13,62,'深圳市精密模具制造有限公司','Shenzhen Precision Mold Manufacturing Co., Ltd.',NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/precision_mold_logo.png','https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/precision_mold_cover.jpg','Injection Molding',NULL,'China','广东','深圳',NULL,NULL,'+86-755-8888-0001','contact@szprecision.com',NULL,2004,'200-500',NULL,NULL,NULL,'专业从事高精度注塑模具设计与制造，拥有20年行业经验，服务汽车、电子、医疗等多个行业。',NULL,'verified','2026-02-17 05:04:18',62,4.80,4.90,4.70,4.80,0.00,0.00,0,0,0,0,'2026-02-17 13:04:17','2026-02-17 13:04:17',NULL),(14,62,'东莞市华强塑胶制品厂','Dongguan Huaqiang Plastic Products Factory',NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/huaqiang_logo.png','https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/huaqiang_cover.jpg','Plastic Manufacturing',NULL,'China','广东','东莞',NULL,NULL,'+86-769-8888-0002','sales@huaqiang-plastic.com',NULL,1998,'500-1000',NULL,NULL,NULL,'专注于高品质塑料制品生产，提供注塑、吹塑、挤出等全方位服务，年产能超过5000吨。',NULL,'verified','2026-02-17 05:04:18',62,4.60,4.70,4.50,4.60,0.00,0.00,0,0,0,0,'2026-02-17 13:04:18','2026-02-17 13:04:18',NULL),(15,62,'宁波市精工机械有限公司','Ningbo Seiko Machinery Co., Ltd.',NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/seiko_logo.png','https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/seiko_cover.jpg','Machinery Manufacturing',NULL,'China','浙江','宁波',NULL,NULL,'+86-574-8888-0003','info@nbseiko.com',NULL,2001,'100-200',NULL,NULL,NULL,'专业生产注塑机、吹塑机等塑料加工设备，技术领先，产品远销欧美市场。',NULL,'verified','2026-02-17 05:04:19',62,4.70,4.80,4.60,4.70,0.00,0.00,0,0,0,0,'2026-02-17 13:04:18','2026-02-17 13:04:18',NULL),(16,62,'苏州工业园区新材料科技公司','Suzhou Industrial Park New Materials Technology Co., Ltd.',NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/materials_logo.png','https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/materials_cover.jpg','Materials R&D',NULL,'China','江苏','苏州',NULL,NULL,'+86-512-8888-0004','rd@sip-materials.com',NULL,2010,'50-100',NULL,NULL,NULL,'专注于高性能工程塑料研发与生产，提供定制化材料解决方案，服务于航空航天、汽车等高端领域。',NULL,'verified','2026-02-17 05:04:19',62,4.90,5.00,4.80,4.90,0.00,0.00,0,0,0,0,'2026-02-17 13:04:19','2026-02-17 13:04:19',NULL),(17,62,'广州市智能制造装备有限公司','Guangzhou Smart Manufacturing Equipment Co., Ltd.',NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/smart_mfg_logo.png','https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/factory_assets/smart_mfg_cover.jpg','Automation Equipment',NULL,'China','广东','广州',NULL,NULL,'+86-20-8888-0005','contact@gzsmart-mfg.com',NULL,2015,'100-200',NULL,NULL,NULL,'提供工业4.0智能制造解决方案，包括自动化生产线、机器人集成、MES系统等。',NULL,'verified','2026-02-17 05:04:19',62,4.50,4.60,4.40,4.50,0.00,0.00,0,0,0,0,'2026-02-17 13:04:19','2026-02-17 13:04:19',NULL);
/*!40000 ALTER TABLE `factories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factory_certifications`
--

DROP TABLE IF EXISTS `factory_certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factory_certifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factoryId` int NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificateNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issuedAt` date DEFAULT NULL,
  `expiresAt` date DEFAULT NULL,
  `fileUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','verified','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `verifiedAt` timestamp NULL DEFAULT NULL,
  `verifiedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `factory_certifications_ibfk_1` FOREIGN KEY (`factoryId`) REFERENCES `factories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factory_certifications`
--

LOCK TABLES `factory_certifications` WRITE;
/*!40000 ALTER TABLE `factory_certifications` DISABLE KEYS */;
INSERT INTO `factory_certifications` VALUES (1,7,'iso','ISO 9001',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(2,7,'iso','ISO 14001',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(3,7,'other','CE',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(4,7,'other','FCC',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(5,8,'iso','ISO 9001',NULL,NULL,'2015-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(6,8,'other','CE',NULL,NULL,'2015-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(7,8,'other','UL',NULL,NULL,'2015-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(8,9,'iso','ISO 9001',NULL,NULL,'2003-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(9,9,'other','BSCI',NULL,NULL,'2003-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(10,9,'other','FDA',NULL,NULL,'2003-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(11,10,'iso','ISO 9001',NULL,NULL,'2010-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(12,10,'other','FSC',NULL,NULL,'2010-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(13,10,'other','CARB',NULL,NULL,'2010-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(14,11,'iso','ISO 9001',NULL,NULL,'2001-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(15,11,'other','OEKO-TEX',NULL,NULL,'2001-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(16,11,'other','GOTS',NULL,NULL,'2001-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(17,12,'iso','ISO 13485',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(18,12,'other','CE',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(19,12,'other','FDA',NULL,NULL,'2008-01-01',NULL,NULL,'verified',NULL,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(20,13,'ISO','ISO 9001:2015','SGS',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:18',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(21,13,'ISO','ISO 14001:2015','TUV',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:18',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(22,13,'IATF','IATF 16949:2016','BSI',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:18',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(23,14,'ISO','ISO 9001:2015','SGS',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:18',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(24,14,'FDA','FDA Food Contact','FDA',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:18',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(25,15,'ISO','ISO 9001:2015','TUV',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:19',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(26,15,'CE','CE Certification','TUV Rheinland',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:19',62,'2026-02-17 13:04:18','2026-02-17 13:04:18'),(27,16,'ISO','ISO 9001:2015','BSI',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:19',62,'2026-02-17 13:04:19','2026-02-17 13:04:19'),(28,16,'ISO','ISO 14001:2015','BSI',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:19',62,'2026-02-17 13:04:19','2026-02-17 13:04:19'),(29,16,'RoHS','RoHS Compliance','SGS',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:19',62,'2026-02-17 13:04:19','2026-02-17 13:04:19'),(30,17,'ISO','ISO 9001:2015','SGS',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:20',62,'2026-02-17 13:04:19','2026-02-17 13:04:19'),(31,17,'CE','CE Certification','TUV SUD',NULL,NULL,NULL,NULL,'verified','2026-02-17 05:04:20',62,'2026-02-17 13:04:19','2026-02-17 13:04:19');
/*!40000 ALTER TABLE `factory_certifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factory_images`
--

DROP TABLE IF EXISTS `factory_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factory_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factoryId` int NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('factory','product','certification') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'factory',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayOrder` int DEFAULT '0',
  `isPrimary` tinyint DEFAULT '0',
  `caption` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_type` (`type`),
  KEY `idx_displayOrder` (`displayOrder`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factory_images`
--

LOCK TABLES `factory_images` WRITE;
/*!40000 ALTER TABLE `factory_images` DISABLE KEYS */;
INSERT INTO `factory_images` VALUES (1,7,'/factory-images/electronics1.jpg','factory',NULL,0,1,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(2,7,'/factory-images/electronics2.webp','factory',NULL,1,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(3,7,'/factory-images/workshop2.jpg','factory',NULL,2,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(4,7,'/factory-images/workshop1.jpg','factory',NULL,3,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(5,8,'/factory-images/smarthome-1.jpg','factory',NULL,0,1,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(6,8,'/factory-images/smarthome-2.jpg','factory',NULL,1,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(7,8,'/factory-images/smarthome-3.png','factory',NULL,2,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(8,8,'/factory-images/smarthome-4.jpg','factory',NULL,3,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(9,9,'/factory-images/consumer-1.jpg','factory',NULL,0,1,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(10,9,'/factory-images/consumer-2.jpg','factory',NULL,1,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(11,9,'/factory-images/consumer-3.jpg','factory',NULL,2,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(12,9,'/factory-images/consumer-4.jpg','factory',NULL,3,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(13,10,'/factory-images/furniture-1.jpg','factory',NULL,0,1,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(14,10,'/factory-images/furniture-2.jpg','factory',NULL,1,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(15,10,'/factory-images/furniture-3.jpg','factory',NULL,2,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(16,10,'/factory-images/furniture-4.jpeg','factory',NULL,3,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(17,11,'/factory-images/workshop1.jpg','factory',NULL,0,1,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(18,11,'/factory-images/workshop2.jpg','factory',NULL,1,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(19,11,'/factory-images/electronics1.jpg','factory',NULL,2,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(20,12,'/factory-images/medical1.png','factory',NULL,0,1,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(21,12,'/factory-images/medical2.png','factory',NULL,1,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(22,12,'/factory-images/workshop1.jpg','factory',NULL,2,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51'),(23,12,'/factory-images/workshop2.jpg','factory',NULL,3,0,NULL,'2026-02-16 08:50:51','2026-02-16 08:50:51');
/*!40000 ALTER TABLE `factory_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factory_products`
--

DROP TABLE IF EXISTS `factory_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factory_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factoryId` int NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `specifications` json DEFAULT NULL,
  `features` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `videos` json DEFAULT NULL,
  `minOrderQuantity` int DEFAULT NULL,
  `priceRange` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leadTime` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customizable` tinyint(1) DEFAULT '0',
  `certifications` json DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `viewCount` int DEFAULT '0',
  `inquiryCount` int DEFAULT '0',
  `displayOrder` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `moq` int DEFAULT '100',
  `favoriteCount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_sku` (`sku`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_displayOrder` (`displayOrder`),
  KEY `idx_factory_products_factory` (`factoryId`),
  CONSTRAINT `factory_products_ibfk_1` FOREIGN KEY (`factoryId`) REFERENCES `factories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factory_products`
--

LOCK TABLES `factory_products` WRITE;
/*!40000 ALTER TABLE `factory_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `factory_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factory_reviews`
--

DROP TABLE IF EXISTS `factory_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factory_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factoryId` int NOT NULL,
  `buyerId` int NOT NULL,
  `orderId` int DEFAULT NULL,
  `webinarId` int DEFAULT NULL,
  `overallScore` decimal(3,2) NOT NULL,
  `qualityScore` decimal(3,2) DEFAULT NULL,
  `deliveryScore` decimal(3,2) DEFAULT NULL,
  `communicationScore` decimal(3,2) DEFAULT NULL,
  `pricingScore` decimal(3,2) DEFAULT NULL,
  `complianceScore` decimal(3,2) DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `pros` text COLLATE utf8mb4_unicode_ci,
  `cons` text COLLATE utf8mb4_unicode_ci,
  `images` json DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT '0',
  `isAnonymous` tinyint(1) DEFAULT '0',
  `status` enum('pending','published','hidden') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `helpfulCount` int DEFAULT '0',
  `replyContent` text COLLATE utf8mb4_unicode_ci,
  `repliedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_buyerId` (`buyerId`),
  KEY `idx_orderId` (`orderId`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `webinarId` (`webinarId`),
  CONSTRAINT `factory_reviews_ibfk_1` FOREIGN KEY (`factoryId`) REFERENCES `factories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `factory_reviews_ibfk_2` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `factory_reviews_ibfk_3` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `factory_reviews_ibfk_4` FOREIGN KEY (`webinarId`) REFERENCES `webinars` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factory_reviews`
--

LOCK TABLES `factory_reviews` WRITE;
/*!40000 ALTER TABLE `factory_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `factory_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `paymentOrderId` int NOT NULL,
  `type` enum('vat','receipt') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'receipt',
  `status` enum('pending','issued','sent','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `taxAmount` decimal(10,2) DEFAULT '0.00',
  `totalAmount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'CNY',
  `companyName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taxNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankAccount` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fileUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issuedAt` timestamp NULL DEFAULT NULL,
  `sentAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoiceNumber` (`invoiceNumber`),
  KEY `idx_userId` (`userId`),
  KEY `idx_paymentOrderId` (`paymentOrderId`),
  KEY `idx_status` (`status`),
  KEY `idx_issuedAt` (`issuedAt`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`paymentOrderId`) REFERENCES `payment_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `negotiation_events`
--

DROP TABLE IF EXISTS `negotiation_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `negotiation_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `webinarId` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdById` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_type` (`type`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `negotiation_events_ibfk_1` FOREIGN KEY (`webinarId`) REFERENCES `webinars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `negotiation_events`
--

LOCK TABLES `negotiation_events` WRITE;
/*!40000 ALTER TABLE `negotiation_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `negotiation_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `data` json DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `readAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_type` (`type`),
  KEY `idx_isRead` (`isRead`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int DEFAULT NULL,
  `productName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specifications` json DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unitPrice` decimal(12,2) NOT NULL,
  `totalPrice` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orderId` (`orderId`),
  KEY `idx_productId` (`productId`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `factory_products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerId` int NOT NULL,
  `factoryId` int NOT NULL,
  `webinarId` int DEFAULT NULL,
  `rfqId` int DEFAULT NULL,
  `quotationId` int DEFAULT NULL,
  `type` enum('intent','formal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'intent',
  `status` enum('draft','pending','confirmed','production','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `totalAmount` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `paymentTerms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryTerms` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryAddress` text COLLATE utf8mb4_unicode_ci,
  `targetDeliveryDate` date DEFAULT NULL,
  `actualDeliveryDate` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `contractUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmedAt` timestamp NULL DEFAULT NULL,
  `shippedAt` timestamp NULL DEFAULT NULL,
  `deliveredAt` timestamp NULL DEFAULT NULL,
  `cancelledAt` timestamp NULL DEFAULT NULL,
  `cancellationReason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNumber` (`orderNumber`),
  KEY `idx_buyerId` (`buyerId`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `webinarId` (`webinarId`),
  KEY `rfqId` (`rfqId`),
  KEY `quotationId` (`quotationId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`factoryId`) REFERENCES `factories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`webinarId`) REFERENCES `webinars` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`rfqId`) REFERENCES `rfqs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`quotationId`) REFERENCES `quotations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_orders`
--

DROP TABLE IF EXISTS `payment_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `subscriptionId` int DEFAULT NULL,
  `planId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('subscription','recharge','upgrade') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'subscription',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'CNY',
  `billingCycle` enum('monthly','yearly') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMethod` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','paid','failed','refunded','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paidAt` timestamp NULL DEFAULT NULL,
  `refundedAt` timestamp NULL DEFAULT NULL,
  `refundAmount` decimal(10,2) DEFAULT NULL,
  `refundReason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNo` (`orderNo`),
  KEY `idx_userId` (`userId`),
  KEY `idx_subscriptionId` (`subscriptionId`),
  KEY `idx_status` (`status`),
  KEY `idx_paidAt` (`paidAt`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `planId` (`planId`),
  CONSTRAINT `payment_orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_orders_ibfk_2` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_orders_ibfk_3` FOREIGN KEY (`planId`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_orders`
--

LOCK TABLES `payment_orders` WRITE;
/*!40000 ALTER TABLE `payment_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_favorites`
--

DROP TABLE IF EXISTS `product_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL COMMENT '产品ID',
  `userId` int DEFAULT NULL COMMENT '用户ID (登录用户)',
  `sessionId` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '会话ID (匿名用户)',
  `webinarId` int DEFAULT NULL COMMENT '会议ID (可选)',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源 (webinar, search, browse)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`userId`,`productId`),
  UNIQUE KEY `unique_session_product` (`sessionId`,`productId`),
  KEY `idx_productId` (`productId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_sessionId` (`sessionId`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品收藏记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_favorites`
--

LOCK TABLES `product_favorites` WRITE;
/*!40000 ALTER TABLE `product_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_inquiries`
--

DROP TABLE IF EXISTS `product_inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_inquiries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL COMMENT '产品ID',
  `webinarId` int DEFAULT NULL COMMENT '会议ID (可选)',
  `userId` int DEFAULT NULL COMMENT '用户ID (可选)',
  `userName` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '询价人姓名',
  `userEmail` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '询价人邮箱',
  `userCompany` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公司名称',
  `userPhone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `quantity` int DEFAULT NULL COMMENT '询价数量',
  `targetPrice` decimal(12,2) DEFAULT NULL COMMENT '目标价格',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD' COMMENT '货币',
  `message` text COLLATE utf8mb4_unicode_ci COMMENT '询价留言',
  `status` enum('pending','replied','quoted','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '状态',
  `repliedAt` timestamp NULL DEFAULT NULL COMMENT '回复时间',
  `repliedBy` int DEFAULT NULL COMMENT '回复人ID',
  `replyMessage` text COLLATE utf8mb4_unicode_ci COMMENT '回复内容',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_productId` (`productId`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品询价记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_inquiries`
--

LOCK TABLES `product_inquiries` WRITE;
/*!40000 ALTER TABLE `product_inquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_interactions`
--

DROP TABLE IF EXISTS `product_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_interactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `webinarId` char(36) NOT NULL COMMENT 'Webinar ID',
  `productId` int NOT NULL COMMENT 'Product ID',
  `userId` char(36) NOT NULL COMMENT 'User ID',
  `userName` varchar(255) DEFAULT NULL COMMENT 'User name',
  `type` varchar(20) NOT NULL COMMENT 'Interaction type: favorite, inquiry, view',
  `metadata` json DEFAULT NULL COMMENT 'Additional metadata',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webinar` (`webinarId`),
  KEY `idx_product` (`productId`),
  KEY `idx_user` (`userId`),
  KEY `idx_type` (`type`),
  KEY `idx_created` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Product interactions (favorites, inquiries, views)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_interactions`
--

LOCK TABLES `product_interactions` WRITE;
/*!40000 ALTER TABLE `product_interactions` DISABLE KEYS */;
INSERT INTO `product_interactions` VALUES (1,'20',49,'2','buyer@tiktok.com','favorite','{}','2026-02-16 04:16:01'),(2,'20',50,'2','buyer@tiktok.com','favorite','{}','2026-02-16 04:16:01'),(3,'20',51,'2','buyer@tiktok.com','favorite','{}','2026-02-16 04:16:01'),(4,'20',49,'2','buyer@tiktok.com','inquiry','{\"message\": \"Interested in bulk order\", \"quantity\": 500, \"targetPrice\": 2.0}','2026-02-16 04:16:01'),(5,'20',53,'2','buyer@tiktok.com','inquiry','{\"message\": \"Need samples first\", \"quantity\": 200, \"targetPrice\": 30.0}','2026-02-16 04:16:01');
/*!40000 ALTER TABLE `product_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_views`
--

DROP TABLE IF EXISTS `product_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL COMMENT '产品ID',
  `userId` int DEFAULT NULL COMMENT '用户ID',
  `sessionId` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '会话ID',
  `webinarId` int DEFAULT NULL COMMENT '会议ID',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源',
  `referrer` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '引荐来源',
  `userAgent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户代理',
  `ipAddress` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '国家',
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '城市',
  `duration` int DEFAULT NULL COMMENT '浏览时长(秒)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_productId` (`productId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_sessionId` (`sessionId`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品浏览记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_views`
--

LOCK TABLES `product_views` WRITE;
/*!40000 ALTER TABLE `product_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moq` int DEFAULT '100',
  `lead_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '7-15 days',
  `price` decimal(10,2) DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `tiktok_views` bigint DEFAULT '0',
  `tiktok_likes` int DEFAULT '0',
  `tiktok_shares` int DEFAULT '0',
  `tiktok_comments` int DEFAULT '0',
  `conversion_rate` decimal(5,2) DEFAULT NULL,
  `trending_score` int DEFAULT '0',
  `daily_sales` int DEFAULT '0',
  `total_sales` int DEFAULT '0',
  `daily_gmv` decimal(15,2) DEFAULT '0.00',
  `total_gmv` decimal(15,2) DEFAULT '0.00',
  `growth_rate` decimal(6,2) DEFAULT NULL,
  `launch_date` date DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `images` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_trending_score` (`trending_score`),
  KEY `idx_supplier_id` (`supplier_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotations`
--

DROP TABLE IF EXISTS `quotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotationNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rfqId` int NOT NULL,
  `factoryId` int NOT NULL,
  `userId` int NOT NULL,
  `unitPrice` decimal(12,2) NOT NULL,
  `totalPrice` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `quantity` int NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leadTime` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryTerms` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentTerms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validUntil` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `status` enum('draft','submitted','accepted','rejected','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `submittedAt` timestamp NULL DEFAULT NULL,
  `acceptedAt` timestamp NULL DEFAULT NULL,
  `rejectedAt` timestamp NULL DEFAULT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quotationNumber` (`quotationNumber`),
  KEY `idx_rfqId` (`rfqId`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_submittedAt` (`submittedAt`),
  CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`rfqId`) REFERENCES `rfqs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`factoryId`) REFERENCES `factories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quotations_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotations`
--

LOCK TABLES `quotations` WRITE;
/*!40000 ALTER TABLE `quotations` DISABLE KEYS */;
/*!40000 ALTER TABLE `quotations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('supplier_evaluation','profit_analysis','negotiation_summary') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'supplier_evaluation',
  `webinarId` int DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `aiAnalysis` text COLLATE utf8mb4_unicode_ci,
  `status` enum('generating','completed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'generating',
  `factoriesAnalyzed` int DEFAULT '0',
  `createdById` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_createdById` (`createdById`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`webinarId`) REFERENCES `webinars` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfqs`
--

DROP TABLE IF EXISTS `rfqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rfqNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerId` int NOT NULL,
  `webinarId` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `specifications` json DEFAULT NULL,
  `targetPrice` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `quantity` int DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetDeliveryDate` date DEFAULT NULL,
  `deliveryTerms` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentTerms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `status` enum('draft','published','closed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `expiresAt` timestamp NULL DEFAULT NULL,
  `quotationCount` int DEFAULT '0',
  `viewCount` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfqNumber` (`rfqNumber`),
  KEY `idx_buyerId` (`buyerId`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `rfqs_ibfk_1` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rfqs_ibfk_2` FOREIGN KEY (`webinarId`) REFERENCES `webinars` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfqs`
--

LOCK TABLES `rfqs` WRITE;
/*!40000 ALTER TABLE `rfqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `rfqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rtm_conversations`
--

DROP TABLE IF EXISTS `rtm_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtm_conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `targetUserId` int DEFAULT NULL,
  `channelName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversationType` enum('private','channel') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'private',
  `lastMessageId` int DEFAULT NULL,
  `lastMessageContent` text COLLATE utf8mb4_unicode_ci,
  `lastMessageAt` timestamp NULL DEFAULT NULL,
  `unreadCount` int DEFAULT '0',
  `isPinned` tinyint(1) DEFAULT '0',
  `isMuted` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conversation` (`userId`,`targetUserId`,`channelName`),
  KEY `idx_userId` (`userId`),
  KEY `idx_targetUserId` (`targetUserId`),
  KEY `idx_channelName` (`channelName`),
  KEY `idx_updatedAt` (`updatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtm_conversations`
--

LOCK TABLES `rtm_conversations` WRITE;
/*!40000 ALTER TABLE `rtm_conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `rtm_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rtm_messages`
--

DROP TABLE IF EXISTS `rtm_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rtm_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `senderId` int NOT NULL,
  `receiverId` int DEFAULT NULL,
  `channelName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `messageType` enum('private','channel') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'private',
  `contentType` enum('text','image','file') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `readAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_senderId` (`senderId`),
  KEY `idx_receiverId` (`receiverId`),
  KEY `idx_channelName` (`channelName`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rtm_messages`
--

LOCK TABLES `rtm_messages` WRITE;
/*!40000 ALTER TABLE `rtm_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `rtm_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nameEn` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `priceMonthly` decimal(10,2) NOT NULL,
  `priceYearly` decimal(10,2) NOT NULL,
  `priceMonthlyUSD` decimal(10,2) DEFAULT NULL,
  `priceYearlyUSD` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'CNY',
  `trialDays` int DEFAULT '0',
  `features` json NOT NULL,
  `limits` json NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isPopular` tinyint(1) DEFAULT '0',
  `displayOrder` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_isActive` (`isActive`),
  KEY `idx_displayOrder` (`displayOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES ('basic','基础套餐','Basic Plan','适合初创工厂和小型供应商',299.00,2990.00,42.00,420.00,'CNY',14,'[\"创建工厂主页\", \"上传产品（最多50个）\", \"接收买家询价（不限）\", \"发起Webinar（每月2场）\", \"参与买家Webinar（不限）\", \"基础数据分析\", \"邮件支持\"]','{\"maxRFQs\": -1, \"maxOrders\": -1, \"storageGB\": 10, \"maxProducts\": 50, \"maxWebinars\": 2, \"supportLevel\": \"email\", \"maxQuotations\": -1, \"recordingHours\": 10}',1,0,2,'2026-02-15 03:44:23','2026-02-15 03:44:23'),('enterprise','企业套餐','Enterprise Plan','适合大型工厂和供应链公司',2999.00,29990.00,420.00,4200.00,'CNY',14,'[\"所有专业套餐功能\", \"上传产品（不限）\", \"发起Webinar（不限）\", \"AI智能营销助手\", \"定制化数据报告\", \"专属客户经理\", \"7x24小时电话支持\", \"API接口\"]','{\"maxRFQs\": -1, \"maxOrders\": -1, \"storageGB\": 500, \"maxProducts\": -1, \"maxWebinars\": -1, \"supportLevel\": \"dedicated\", \"maxQuotations\": -1, \"recordingHours\": 500}',1,0,4,'2026-02-15 03:44:23','2026-02-15 03:44:23'),('free_trial','免费试用','Free Trial','14天免费试用，体验平台核心功能',0.00,0.00,0.00,0.00,'CNY',14,'[\"创建工厂主页\", \"上传产品（最多5个）\", \"接收买家询价（最多3个）\", \"参与买家发起的Webinar（被动参与）\", \"基础数据统计\"]','{\"maxRFQs\": 3, \"maxOrders\": 0, \"storageGB\": 1, \"maxProducts\": 5, \"maxWebinars\": 0, \"supportLevel\": \"email\", \"maxQuotations\": 3, \"recordingHours\": 0}',1,0,1,'2026-02-15 03:44:23','2026-02-15 03:44:23'),('professional','专业套餐','Professional Plan','适合中型工厂和成长型企业',999.00,9990.00,140.00,1400.00,'CNY',14,'[\"所有基础套餐功能\", \"上传产品（最多200个）\", \"发起Webinar（每月10场）\", \"AI智能报价助手\", \"高级数据分析\", \"优先展示\", \"电话+邮件支持\"]','{\"maxRFQs\": -1, \"maxOrders\": -1, \"storageGB\": 50, \"maxProducts\": 200, \"maxWebinars\": 10, \"supportLevel\": \"phone\", \"maxQuotations\": -1, \"recordingHours\": 50}',1,1,3,'2026-02-15 03:44:23','2026-02-15 03:44:23');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `planId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('trial','active','expired','cancelled','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'trial',
  `billingCycle` enum('monthly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'CNY',
  `currentPeriodStart` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `currentPeriodEnd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `trialStart` timestamp NULL DEFAULT NULL,
  `trialEnd` timestamp NULL DEFAULT NULL,
  `autoRenew` tinyint(1) DEFAULT '1',
  `renewalDate` timestamp NULL DEFAULT NULL,
  `cancelledAt` timestamp NULL DEFAULT NULL,
  `cancellationReason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_planId` (`planId`),
  KEY `idx_status` (`status`),
  KEY `idx_currentPeriodEnd` (`currentPeriodEnd`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`planId`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_flag` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_country` (`country`),
  KEY `idx_rating` (`rating`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'BeautyPro Manufacturing','https://via.placeholder.com/100','China','🇨🇳',4.80,'contact@beautypro.com',NULL,NULL,NULL,NULL,'2026-02-16 11:51:00','2026-02-16 11:51:00'),(2,'HealthWell Supplies','https://via.placeholder.com/100','USA','🇺🇸',4.90,'info@healthwell.com',NULL,NULL,NULL,NULL,'2026-02-16 11:51:00','2026-02-16 11:51:00'),(3,'TechGear Electronics','https://via.placeholder.com/100','South Korea','🇰🇷',4.70,'sales@techgear.kr',NULL,NULL,NULL,NULL,'2026-02-16 11:51:00','2026-02-16 11:51:00'),(4,'HomeStyle Living','https://via.placeholder.com/100','Vietnam','🇻🇳',4.60,'contact@homestyle.vn',NULL,NULL,NULL,NULL,'2026-02-16 11:51:00','2026-02-16 11:51:00');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text,
  `config_type` enum('string','number','json','boolean') DEFAULT 'string',
  `category` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`),
  KEY `idx_category` (`category`),
  KEY `idx_public` (`is_public`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (7,'gold_member_threshold','92','number','business','Gold Member评分阈值',1,'2026-02-16 13:57:10'),(8,'score_badge_rules','{\"90\":\"gold\",\"80\":\"silver\",\"70\":\"bronze\",\"0\":\"gray\"}','json','ui','评分徽章规则',1,'2026-02-16 13:57:10'),(9,'status_badge_config','{\"live\":{\"color\":\"bg-red-500\",\"label\":\"Live\"},\"scheduled\":{\"color\":\"bg-blue-500\",\"label\":\"Scheduled\"},\"completed\":{\"color\":\"bg-green-500\",\"label\":\"Completed\"},\"draft\":{\"color\":\"bg-gray-500\",\"label\":\"Draft\"},\"cancelled\":{\"color\":\"bg-gray-500\",\"label\":\"Cancelled\"}}','json','ui','状态徽章配置',1,'2026-02-16 13:57:10'),(10,'oss_base_url','https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com','string','integration','OSS基础URL',1,'2026-02-16 13:57:10'),(11,'directus_url','https://admin.cnsubscribe.xyz','string','integration','Directus API地址',1,'2026-02-16 13:57:10'),(12,'default_ontime_rate','95','number','business','默认准时率',0,'2026-02-16 13:57:10');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `isPublic` tinyint(1) DEFAULT '0',
  `updatedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_key` (`category`,`key`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usage_records`
--

DROP TABLE IF EXISTS `usage_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usage_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `resourceType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `count` int DEFAULT '1',
  `periodStart` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `periodEnd` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_resourceType` (`resourceType`),
  KEY `idx_periodStart` (`periodStart`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `usage_records_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usage_records`
--

LOCK TABLES `usage_records` WRITE;
/*!40000 ALTER TABLE `usage_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `usage_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `interests` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','buyer','factory','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` enum('active','suspended','deleted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `emailVerified` tinyint(1) DEFAULT '0',
  `phoneVerified` tinyint(1) DEFAULT '0',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loginMethod` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  `lastLoginIp` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test5@realsourcing.com','test5@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','测试用户5',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 03:46:20','2026-02-15 03:46:20',NULL),(2,'test6@realsourcing.com','test6@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','测试用户6',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 03:46:45','2026-02-15 03:46:45',NULL),(3,'test8@realsourcing.com','test8@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','测试8',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 03:49:09','2026-02-15 03:49:09',NULL),(4,'lisi@realsourcing.com','lisi@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','李四',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 03:53:08','2026-02-15 03:53:08',NULL),(5,'testuser@test.com','testuser@test.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','Test User',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 03:54:25','2026-02-15 03:54:25',NULL),(6,'zhangsan@realsourcing.com','zhangsan@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','张三',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 03:55:02','2026-02-15 03:55:02',NULL),(7,'wangwu@realsourcing.com','wangwu@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','王五',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 04:00:48','2026-02-15 04:00:48',NULL),(8,'zhaoliu@realsourcing.com','zhaoliu@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','赵六',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 04:24:10','2026-02-15 04:24:10',NULL),(9,'zhaoliu2@realsourcing.com','zhaoliu2@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','赵六2',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 04:24:23','2026-02-15 04:24:23',NULL),(38,'testabc@realsourcing.com','testabc@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','测试用户ABC',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 04:54:42','2026-02-15 04:54:42',NULL),(46,'testnew@realsourcing.com','testnew@realsourcing.com',NULL,'85777f270ad7cf2a790981bbae3c4e484a1dc55e24a77390d692fbf1cffa12fa','Test User New',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-15 05:09:19','2026-02-15 05:09:19',NULL),(62,'admin_openid_1771231516591','admin@realsourcing.com',NULL,NULL,'Admin User',NULL,'admin','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-16 08:45:16','2026-02-16 08:45:16',NULL),(63,'magicy565@gmail.com','magicy565@gmail.com',NULL,'e223a51185fe6cba6925536b5befe9a0acce2307d55ec39c699e8b7119424193','magicyang',NULL,'buyer','active',0,0,'en',NULL,NULL,NULL,NULL,'2026-02-17 08:12:19','2026-02-17 08:12:19',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webinar_factories`
--

DROP TABLE IF EXISTS `webinar_factories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webinar_factories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `webinar_id` char(36) DEFAULT NULL,
  `factory_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webinar_factories`
--

LOCK TABLES `webinar_factories` WRITE;
/*!40000 ALTER TABLE `webinar_factories` DISABLE KEYS */;
INSERT INTO `webinar_factories` VALUES (1,'38','16');
/*!40000 ALTER TABLE `webinar_factories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webinar_participants`
--

DROP TABLE IF EXISTS `webinar_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webinar_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `webinarId` int NOT NULL,
  `userId` int NOT NULL,
  `factoryId` int DEFAULT NULL,
  `role` enum('host','presenter','participant','observer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'participant',
  `status` enum('invited','accepted','declined','joined','left') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'invited',
  `invitedAt` timestamp NULL DEFAULT NULL,
  `joinedAt` timestamp NULL DEFAULT NULL,
  `leftAt` timestamp NULL DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `agoraUid` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hasVideo` tinyint(1) DEFAULT '0',
  `hasAudio` tinyint(1) DEFAULT '0',
  `screenSharing` tinyint(1) DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_webinar_user` (`webinarId`,`userId`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_factoryId` (`factoryId`),
  KEY `idx_status` (`status`),
  CONSTRAINT `webinar_participants_ibfk_1` FOREIGN KEY (`webinarId`) REFERENCES `webinars` (`id`) ON DELETE CASCADE,
  CONSTRAINT `webinar_participants_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `webinar_participants_ibfk_3` FOREIGN KEY (`factoryId`) REFERENCES `factories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webinar_participants`
--

LOCK TABLES `webinar_participants` WRITE;
/*!40000 ALTER TABLE `webinar_participants` DISABLE KEYS */;
INSERT INTO `webinar_participants` VALUES (1,35,62,14,'presenter','accepted','2026-02-17 05:04:20','2026-02-17 05:04:20',NULL,NULL,NULL,0,0,0,NULL,'2026-02-17 13:04:20','2026-02-17 13:04:20'),(3,36,62,14,'presenter','accepted','2026-02-17 05:04:21','2026-02-17 05:04:21',NULL,NULL,NULL,0,0,0,NULL,'2026-02-17 13:04:20','2026-02-17 13:04:20'),(7,37,62,15,'presenter','accepted','2026-02-17 05:04:21','2026-02-17 05:04:21',NULL,NULL,NULL,0,0,0,NULL,'2026-02-17 13:04:20','2026-02-17 13:04:20'),(11,38,62,16,'presenter','accepted','2026-02-17 05:04:21','2026-02-17 05:04:21',NULL,NULL,NULL,0,0,0,NULL,'2026-02-17 13:04:21','2026-02-17 13:04:21');
/*!40000 ALTER TABLE `webinar_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webinar_products`
--

DROP TABLE IF EXISTS `webinar_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webinar_products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `webinarId` char(36) NOT NULL COMMENT 'Webinar ID',
  `productId` int NOT NULL COMMENT 'Product ID',
  `displayOrder` int DEFAULT '0' COMMENT 'Display order in webinar',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_webinar_product` (`webinarId`,`productId`),
  KEY `idx_webinar` (`webinarId`),
  KEY `idx_product` (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Junction table for webinars and products';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webinar_products`
--

LOCK TABLES `webinar_products` WRITE;
/*!40000 ALTER TABLE `webinar_products` DISABLE KEYS */;
INSERT INTO `webinar_products` VALUES (7,'20',49,1,'2026-02-16 04:16:01'),(8,'20',50,2,'2026-02-16 04:16:01'),(9,'20',51,3,'2026-02-16 04:16:01'),(10,'20',52,4,'2026-02-16 04:16:01'),(11,'20',53,5,'2026-02-16 04:16:01'),(12,'20',54,6,'2026-02-16 04:16:01');
/*!40000 ALTER TABLE `webinar_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webinar_recordings`
--

DROP TABLE IF EXISTS `webinar_recordings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webinar_recordings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `webinarId` int NOT NULL COMMENT '会议ID',
  `recordingId` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '录制ID (Agora)',
  `fileName` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文件名',
  `fileUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文件URL',
  `fileSize` bigint DEFAULT NULL COMMENT '文件大小(字节)',
  `duration` int DEFAULT NULL COMMENT '时长(秒)',
  `format` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '格式 (mp4, webm)',
  `resolution` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分辨率',
  `status` enum('processing','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'processing' COMMENT '状态',
  `startedAt` timestamp NULL DEFAULT NULL COMMENT '开始录制时间',
  `completedAt` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `viewCount` int DEFAULT '0' COMMENT '观看次数',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_status` (`status`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议录制文件表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webinar_recordings`
--

LOCK TABLES `webinar_recordings` WRITE;
/*!40000 ALTER TABLE `webinar_recordings` DISABLE KEYS */;
/*!40000 ALTER TABLE `webinar_recordings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webinar_stats`
--

DROP TABLE IF EXISTS `webinar_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webinar_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `webinarId` int NOT NULL COMMENT '会议ID',
  `totalViews` int DEFAULT '0' COMMENT '总浏览量',
  `uniqueViews` int DEFAULT '0' COMMENT '独立访客数',
  `totalInquiries` int DEFAULT '0' COMMENT '总询价数',
  `totalFavorites` int DEFAULT '0' COMMENT '总收藏数',
  `totalMessages` int DEFAULT '0' COMMENT '总消息数',
  `peakParticipants` int DEFAULT '0' COMMENT '峰值参会人数',
  `avgDurationMinutes` int DEFAULT '0' COMMENT '平均观看时长(分钟)',
  `totalDurationMinutes` int DEFAULT '0' COMMENT '总观看时长(分钟)',
  `conversionRate` decimal(5,2) DEFAULT '0.00' COMMENT '转化率(%)',
  `engagementScore` decimal(5,2) DEFAULT '0.00' COMMENT '互动评分',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `webinarId` (`webinarId`),
  KEY `idx_webinarId` (`webinarId`),
  KEY `idx_totalViews` (`totalViews` DESC),
  KEY `idx_conversionRate` (`conversionRate` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议统计数据表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webinar_stats`
--

LOCK TABLES `webinar_stats` WRITE;
/*!40000 ALTER TABLE `webinar_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `webinar_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webinars`
--

DROP TABLE IF EXISTS `webinars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webinars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdById` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('one_to_one','group','webinar') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'one_to_one',
  `status` enum('draft','scheduled','live','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `scheduledAt` timestamp NULL DEFAULT NULL,
  `startedAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  `duration` int DEFAULT '60',
  `actualDuration` int DEFAULT NULL,
  `maxParticipants` int DEFAULT '10',
  `currentParticipants` int DEFAULT '0',
  `agoraChannelName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agoraToken` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recordingEnabled` tinyint(1) DEFAULT '1',
  `recordingStatus` enum('none','recording','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recordingUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coverImage` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `workSpec` text COLLATE utf8mb4_unicode_ci,
  `aiSummary` text COLLATE utf8mb4_unicode_ci,
  `viewCount` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  `meetingType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'standard',
  `factoryId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'small',
  `productCount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_createdById` (`createdById`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduledAt` (`scheduledAt`),
  KEY `idx_category` (`category`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_webinars_meeting_type` (`meetingType`),
  CONSTRAINT `webinars_ibfk_1` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webinars`
--

LOCK TABLES `webinars` WRITE;
/*!40000 ALTER TABLE `webinars` DISABLE KEYS */;
INSERT INTO `webinars` VALUES (1,8,'TikTok Hot Products Sourcing Session','Discover trending products perfect for TikTok Shop and social commerce','E-commerce','webinar','scheduled','en','2026-02-16 02:00:00',NULL,NULL,120,NULL,100,0,NULL,NULL,1,NULL,NULL,'/covers/tiktok-sourcing.png',NULL,NULL,NULL,0,'2026-02-15 04:34:35','2026-02-15 04:34:35',NULL,'standard',NULL,'small',0),(2,8,'LED Lighting Solutions 2026','Latest LED lighting products and technologies for commercial and residential use','Electronics','webinar','scheduled','en','2026-02-23 06:00:00',NULL,NULL,120,NULL,150,0,NULL,NULL,1,NULL,NULL,'/covers/led-lighting.png',NULL,NULL,NULL,0,'2026-02-15 04:34:35','2026-02-15 04:34:35',NULL,'standard',NULL,'small',0),(3,8,'Influencer Product Selection - Beauty & Personal Care','Curated beauty and personal care products perfect for influencer marketing','Beauty','webinar','scheduled','en','2026-02-17 01:00:00',NULL,NULL,120,NULL,80,0,NULL,NULL,1,NULL,NULL,'/covers/influencer-selection.png',NULL,NULL,NULL,0,'2026-02-15 04:34:35','2026-02-15 04:34:35',NULL,'standard',NULL,'small',0),(4,8,'Consumer Electronics Q1 Sourcing Fair','Quarterly sourcing event featuring the latest consumer electronics','Electronics','webinar','live','en','2026-02-18 05:00:00',NULL,NULL,240,NULL,200,0,NULL,NULL,1,NULL,NULL,'/covers/consumer-electronics.png',NULL,NULL,NULL,0,'2026-02-15 04:34:35','2026-02-15 04:34:35',NULL,'standard',NULL,'small',0),(5,8,'Global Sources Hong Kong Show Tour','A comprehensive tour of the Global Sources Hong Kong show, featuring top electronics and lifestyle suppliers.','electronics','webinar','completed','en','2026-02-13 04:44:27',NULL,NULL,33,NULL,200,156,'webinar_hk_show_tour',NULL,1,NULL,NULL,'/global-sources-tour.png',NULL,NULL,NULL,0,'2026-02-05 04:44:27','2026-02-13 04:44:27',NULL,'standard',NULL,'small',0),(6,8,'TikTok Hot Products Sourcing Session','Fast-track sourcing for TikTok Shop sellers. Connect with 5 verified factories offering low MOQ (100-500 units), fast sampling (7-14 days), and dropshipping support. Perfect for trending products like beauty tools, phone accessories, and home gadgets.','consumer-goods','group','scheduled','en','2026-02-16 04:44:27',NULL,NULL,60,NULL,8,0,'webinar_tiktok_001',NULL,1,NULL,NULL,'/covers/tiktok-sourcing.png',NULL,NULL,NULL,0,'2026-02-14 04:44:27','2026-02-14 04:44:27',NULL,'standard',NULL,'small',0),(7,8,'Influencer Product Selection - Beauty & Personal Care','Exclusive product selection session for verified influencers (50K+ followers). 8 beauty manufacturers will showcase their latest products, offer exclusive pricing, and discuss commission structures. Perfect for live streaming and social commerce.','beauty','group','scheduled','en','2026-02-17 04:44:27',NULL,NULL,90,NULL,10,0,'webinar_influencer_001',NULL,1,NULL,NULL,'/covers/influencer-selection.png',NULL,NULL,NULL,0,'2026-02-13 04:44:27','2026-02-13 04:44:27',NULL,'standard',NULL,'small',0),(8,8,'Smart Home Products Showcase 2026','Explore the latest smart home innovations from top Chinese manufacturers. This webinar features live product demonstrations, real-time Q&A sessions, and exclusive pricing for international buyers.','smart-home','webinar','live','en','2026-02-15 04:44:28',NULL,NULL,90,NULL,50,42,'webinar_smart_home_001',NULL,1,NULL,NULL,'/covers/smarthome-showcase.png',NULL,NULL,NULL,0,'2026-02-08 04:44:28','2026-02-15 04:44:28',NULL,'standard',NULL,'small',0),(9,8,'Sustainable Packaging Solutions','Discover eco-friendly packaging alternatives from certified green manufacturers. Topics include biodegradable materials, recycled packaging, and carbon-neutral shipping solutions.','consumer-goods','webinar','completed','en','2026-02-10 04:44:28',NULL,NULL,60,NULL,30,28,'webinar_packaging_green',NULL,1,NULL,NULL,'/covers/sustainable-textiles.png',NULL,NULL,NULL,0,'2026-02-01 04:44:28','2026-02-10 04:44:28',NULL,'standard',NULL,'small',0),(10,8,'Test Webinar - CRUD Demo (Updated)','This is a test webinar to demonstrate CRUD operations','Testing','webinar','scheduled','en','2026-03-01 02:00:00',NULL,NULL,60,NULL,50,0,NULL,NULL,1,NULL,NULL,'/test-cover.png',NULL,NULL,NULL,0,'2026-02-15 04:47:53','2026-02-15 04:48:14','2026-02-14 20:48:15','standard',NULL,'small',0),(11,8,'智能制造技术研讨会','探讨工业4.0时代的智能制造技术与应用案例','E-commerce','webinar','scheduled','en','2026-02-17 06:00:00',NULL,NULL,120,NULL,100,0,NULL,NULL,1,NULL,NULL,'/covers/industrial.png',NULL,NULL,NULL,0,'2026-02-15 16:01:11','2026-02-15 16:01:11',NULL,'standard',NULL,'small',0),(12,8,'电子元器件采购策略','2026年电子元器件市场趋势与采购优化策略','Electronics','webinar','scheduled','zh','2026-02-17 02:00:00',NULL,NULL,120,NULL,100,32,NULL,NULL,1,NULL,NULL,'/covers/electronics.png',NULL,NULL,NULL,0,'2026-02-15 16:01:40','2026-02-15 16:01:40',NULL,'standard',NULL,'small',0),(13,8,'供应链数字化转型','如何通过数字化技术优化供应链管理','Supply Chain','webinar','scheduled','zh','2026-02-18 07:00:00',NULL,NULL,120,NULL,100,58,NULL,NULL,1,NULL,NULL,'/covers/supply-chain.png',NULL,NULL,NULL,0,'2026-02-15 16:01:41','2026-02-15 16:01:41',NULL,'standard',NULL,'small',0),(14,8,'工业机器人应用实践','工业机器人在制造业中的应用案例分享','Automation','webinar','scheduled','zh','2026-02-19 05:30:00',NULL,NULL,120,NULL,100,41,NULL,NULL,1,NULL,NULL,'/covers/robotics.png',NULL,NULL,NULL,0,'2026-02-15 16:01:43','2026-02-15 16:01:43',NULL,'standard',NULL,'small',0),(15,8,'绿色制造与可持续发展','探讨制造业的环保技术与可持续发展路径','Green Tech','webinar','live','zh','2026-02-15 01:00:00',NULL,NULL,120,NULL,100,67,NULL,NULL,1,NULL,NULL,'/covers/green-tech.png',NULL,NULL,NULL,0,'2026-02-15 16:01:44','2026-02-15 16:01:44',NULL,'standard',NULL,'small',0),(16,8,'质量管理体系优化','ISO 9001质量管理体系的实施与优化','Quality Management','webinar','scheduled','zh','2026-02-20 06:00:00',NULL,NULL,120,NULL,100,28,NULL,NULL,1,NULL,NULL,'/covers/quality.png',NULL,NULL,NULL,0,'2026-02-15 16:01:46','2026-02-15 16:01:46',NULL,'standard',NULL,'small',0),(17,8,'新能源汽车零部件采购','新能源汽车产业链的采购机会与挑战','Automotive','webinar','scheduled','zh','2026-02-21 08:00:00',NULL,NULL,120,NULL,100,52,NULL,NULL,1,NULL,NULL,'/covers/automotive.png',NULL,NULL,NULL,0,'2026-02-15 16:01:47','2026-02-15 16:01:47',NULL,'standard',NULL,'small',0),(18,8,'5G通信设备技术分享','5G通信设备的最新技术与市场趋势','Telecommunications','webinar','scheduled','zh','2026-02-22 02:00:00',NULL,NULL,120,NULL,100,39,NULL,NULL,1,NULL,NULL,'/covers/5g.png',NULL,NULL,NULL,0,'2026-02-15 16:01:48','2026-02-15 16:01:48',NULL,'standard',NULL,'small',0),(19,1,'TikTok Hot Products Sourcing - Q3 Trends','Discover the hottest trending products for TikTok sellers.',NULL,'webinar','scheduled','en',NULL,NULL,NULL,60,NULL,10,0,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-16 03:59:56','2026-02-16 03:59:56',NULL,'sourcing','1','small',6),(20,1,'TikTok Hot Products Sourcing - Q3 Trends','Discover the hottest trending products for TikTok sellers.',NULL,'webinar','scheduled','en',NULL,NULL,NULL,60,NULL,10,0,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-16 04:14:13','2026-02-16 04:14:13',NULL,'sourcing','1','small',6),(21,1,'Leading the way for systems change: Helena Helmersson on making sustainability a core business imperative','**Speaker**: Helena Helmersson\n**Title**: Former CEO of H&M Group\n\nFew leaders in the apparel and textiles industry bring as much hands-on experience across buying, production and CSR as Helena Helmersson did during her time at H&M Group. Her unique position as the only fashion industry executive to move from CSO to CEO gives her a rare, end-to-end view of how sustainability and commercial strategy intersect at scale. Helmersson’s long-term vision at H&M was clear: sustainability had to be embedded at the heart of the business. Building on work initiated in the 1990s, she helped advance a strategy that increased supply chain transparency, while also expanding textile collection and recycling programmes. Under her leadership, initiatives such as the H&M Conscious range were debuted, reinforcing the belief that sustainable fashion must remain accessible while serving as co-chair of The Fashion Pact. A consistent theme throughout Helmersson’s leadership has been the need for structural transformation. Sustainability, she argues, should be a mindset that is woven into every part of the organisation. In times of external turbulence, however, delivering on that ambition becomes harder. Helmersson is clear that progress cannot be achieved through brand commitments alone; new systems need to be built, and deep, cross-industry collaboration is essential. Since stepping down as CEO of H&M in January 2024, Helmersson has continued to shape the industry. She has joined the boards of MANGO, Quizrr and On, and serves as Chair of Circulose. In this webinar with built in Q&A time, Helena Helmersson will share reflections on: What leadership looks like when driving structural change within large organisations; What enables, and inhibits, CEO action on sustainability, including navigating the tension between profitability and sustainability; Collaboration in practice: how deep coalitions can work for business; Where the industry goes next, and the role each stakeholder must play in delivering change.\n\n**Organizer**: Innovation Forum\n**Register**: https://innovationforum.co.uk/webinar/leading-the-way-for-systems-change-helena-helmersson-on-making-sustainability-a-core-business-imperative/','Apparel & Textiles','webinar','scheduled','en','2026-02-17 07:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/sustainable_fashion.webp','[\"sustainability\", \"leadership\", \"supply-chain\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(22,1,'Powering the digital age: data centres, AI, and the future of grid stability','**Speaker**: Sophie Graham, Steven Carlini, Íris Baldursdóttir, Ian Welsh\n**Title**: Chief sustainability officer, IFS; Chief advocate AI and data center, Schneider Electric; Chief executive officer, SnerpaPower; Co-founder and chair, Innovation Forum\n\nThe rapid expansion of data centres and AI is reshaping electricity demand at an unprecedented pace — creating new pressures on grids, planning frameworks and decarbonisation efforts. As digital infrastructure becomes more central to economic growth and innovation, energy systems must evolve to remain stable, flexible and sustainable. Join energy, technology and infrastructure leaders to explore: How data centres and AI are changing electricity demand profiles and what this means for grid stability, the role of microgrids, on-site generation and energy storage in managing energy surges and improving resilience, how grids can be designed to accommodate growing digital demand while remaining efficient and decarbonised, and the planning, regulatory and technology shifts needed to manage the long-term impact of AI-driven energy growth. Speakers include Sophie Graham, chief sustainability officer at IFS, Steven Carlini, chief advocate AI and data center at Schneider Electric, and Íris Baldursdóttir, chief executive officer at SnerpaPower.\n\n**Organizer**: Innovation Forum\n**Register**: https://us02web.zoom.us/webinar/register/2917701982374/WN_yOD3drELTxadeyY0PryFug','Energy','webinar','scheduled','en','2026-02-25 07:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/data_center_ai.jpg','[\"data centres\", \"AI\", \"grid stability\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(23,1,'Advancing climate-smart crops: R&D driving on-farm change','**Speaker**: Lyle DePauw\n**Title**: Director, crop innovation, Cargill\n\nAs the agriculture sector accelerates toward more resilient systems, the search for climate-smart crops continues to gather pace. Innovation in crop systems is key to unlocking solutions that deliver resilience, productivity, and lower carbon outcomes. This webinar explores the potential of winter camelina, an oilseed crop advancing through research, innovation, and on-farm trial, as part of a broader push for crop diversification and low-carbon fuel feedstocks. Planted in the fall and harvested in early summer, camelina provides living cover through the off-season while also being harvested and sold as a cash crop – an uncommon combination that creates a new incentive for farmers to keep soil covered longer. The discussion will cover: How crop innovation and R&D are supporting more resilient and profitable farming systems; The role of winter camelina in crop diversification, soil health, and lower-carbon outcomes; The importance of farmer engagement, partnerships, and on-farm trials in driving adoption; What lessons from camelina can be applied to broader climate-smart agriculture strategies. Speakers include Lyle DePauw (Director, crop innovation, Cargill), Mitch Hunter (Co-director, Forever Green Initiative, University of Minnesota), Anna Teeter (Novel oilseeds program manager, Cargill), Anne Schwagerl (Vice president, Minnesota Farmers Union), and Ian Welsh (Chair, Innovation Forum) as moderator.\n\n**Organizer**: Innovation Forum\n**Register**: https://us02web.zoom.us/webinar/register/2917707237434/WN_dS4wHasIQ8OBRR_2DG5oNQ#/registration','Agriculture','webinar','scheduled','en','2026-02-26 07:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/climate_smart_agriculture.jpg','[\"climate-smart crops\", \"R&D\", \"agriculture\", \"crop innovation\", \"sustainability\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(24,1,'Joint Webinar: Unlocking Supply Chain Excellence with Agentic AI','**Speaker**: Not available\n\nDon’t miss out on this opportunity to learn how Agentic AI is revolutionizing supply chain management and logistics operations. Discover how Agentic AI is revolutionizing supply chain and logistics operations with automation and predictive intelligence. In this live session, you’ll see how Amazon QuickSuite helps organizations: Reduce operational costs by up to 50%, Minimize stockouts by 96%, Optimize routes, inventory, and freight movement, Build a proactive, AI-driven supply chain. Live demos and practical insights included. The agenda includes: Part 1: Revolutionizing Supply Chain with Amazon QuickSuite (20 minutes) - Key capabilities of Amazon QuickSuite, Live Demo: QuickSuite platform in action. Part 2: Practical Applications in Logistics (20 minutes) - AI-driven demand forecasting, Optimizing logistics operations and route planning. Part 3: Q&A (10 minutes) - Audience Q&A and key takeaways, Next steps for implementation and ROI expectations.\n\n**Organizer**: AWS & Royal Cyber\n**Register**: https://www.eventbrite.com/e/joint-webinar-unlocking-supply-chain-excellence-with-agentic-ai-tickets-1982008378414','Supply Chain','webinar','scheduled','en','2026-02-25 10:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/supply_chain_ai.png','[\"AgenticAI\", \"SupplyChainTransformation\", \"AWS\", \"LogisticsTech\", \"InventoryAI\", \"FreightAutomation\", \"DigitalSupplyChain\", \"RoyalCyber\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(25,1,'2026 Global Trade Turning Point','**Speaker**: Dr. Samuel Roscoe\n**Title**: Lecturer, UBC Sauder School of Business\n\n本次Webinar活动主题为“2026全球贸易转折点”，由UBC Sauder商学院讲师Samuel Roscoe博士主讲。Samuel Roscoe博士是地缘政治中断和供应链风险领域的专家。本次活动将深入探讨全球贸易格局在2026年面临的关键转折点，包括全球贸易战的应对策略以及如何构建更具韧性的供应链。参与者将有机会了解当前国际贸易环境的复杂性，以及企业和个人应如何准备以应对潜在的经济挑战。Roscoe博士将分享其在管理供应链风险方面的专业见解，并提供实用的策略，帮助企业在不确定性中保持竞争力。本次Webinar旨在为政策制定者、商业领袖以及对全球贸易趋势感兴趣的专业人士提供前瞻性的分析和解决方案。讨论内容将涵盖关税影响、贸易政策变化、以及如何通过多元化和区域化供应链来降低风险。\n\n**Organizer**: Not available','Global Trade','webinar','scheduled','en','2026-03-15 02:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/global_trade.png','[\"global trade\", \"supply chain\", \"geopolitics\", \"trade wars\", \"resilience\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(26,1,'Advance: Women in Manufacturing - Keys to Success','**Speaker**: Jillian van Duinkerken, Sally Morse, Kimberly Benedict, Elissa Ross\n**Title**: CEO, Duinkerken Foods; CEO and Co-Founder, Spectra Supply; Vice President, Heartland Polymers Operations, Inter Pipeline; CEO and Co-Founder, Metafold 3D\n\nThis webinar will feature a discussion with accomplished women in Canadian manufacturing. Together, we will explore the pivotal moments, decisions and strategies that shaped their careers—and the lessons they’ve learned along the way. From navigating career pivots and embracing lifelong learning to overcoming challenges and “failing forward,” our panelists will share candid insights on what it takes to thrive in a dynamic industry. Attendees will gain practical advice and actionable takeaways for professional growth and development. Webinar takeaways: -How top leaders built their paths to success -The role of education, mentorship and adaptability -Strategies for professional growth and leadership in manufacturing Stay on the webinar till the end as we will reveal the winners of the inaugural Advance: Women in Manufacturing Awards, including a fireside chat with one of the recipients. Speakers: Jillian van Duinkerken, CEO, Duinkerken Foods; Sally Morse, CEO and Co-Founder, Spectra Supply; Kimberly Benedict, Vice President, Heartland Polymers Operations, Inter Pipeline; Elissa Ross, PhD, CEO and Co-Founder, Metafold 3D.\n\n**Organizer**: Plant\n**Register**: https://us02web.zoom.us/webinar/register/WN_eMfUrPmHSvKBiLmjGi14AQ#/registration','Manufacturing','webinar','scheduled','en','2026-03-05 10:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/women_manufacturing.webp','[\"manufacturing\", \"women in manufacturing\", \"leadership\", \"career development\", \"professional growth\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(27,1,'Fireside Chat with Gartner Expert Suzie Petrusic: Navigating Risk in the Evolving World of CSCOs','**Speaker**: Suzie Petrusic\n**Title**: Sr Director Analyst, Gartner\n\nJoin us for an exclusive fireside chat as the Editor-in-Chief Bob Bowman of SupplyChainBrain sits down with a leading Gartner Expert, Suzie Petrusic to discuss the latest trends, challenges, and opportunities facing Chief Supply Chain Officers (CSCOs) today. This in-depth conversation will explore the evolving landscape of supply chain risk, its impact on global operations, and the strategies CSCOs are using to stay ahead. Attendees will have the opportunity to ask live questions and gain firsthand insights into how industry leaders are addressing the most pressing risks in supply chain management. Don’t miss this chance to engage with a top Gartner expert and stay informed on what’s shaping the future of supply chains.\n\n**Organizer**: Gartner\n**Register**: https://www.supplychainbrain.com/articles/43386-fireside-chat-with-gartner-expert-suzie-petrusic-navigating-risk-in-the-evolving-world-of-cscos','Supply Chain Management','webinar','scheduled','en','2026-03-17 08:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/gartner_supply_chain.jpg','[\"supply-chain\", \"risk-management\", \"CSCOs\", \"logistics\", \"artificial-intelligence\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(28,1,'Member Webinar: State of the Industry Report 2026: Decarbonization Progress in the Apparel, Footwear & Textiles Industry','**Speaker**: Joël Mertens, Quinten Geleijnse, Cassandra Lindow\n**Title**: Director, Higg Product Tools, Cascale; Manager, Higg Product Tools - LCA, Cascale; Senior Manager, Reporting Tool Analyst, Cascale\n\nCascale recently released the State of the Industry Report 2026: Decarbonization Progress in the Apparel, Footwear & Textiles Industry, an in-depth report highlighting that the sector is not decarbonizing at the pace or scale required to meet global climate targets. Cascale will host a member-only webinar on March 4 to provide a deep dive into the report. In this webinar, Cascale will walk through key findings, which draw on verified 2023 and 2024 energy data from the Higg Facility Environmental Module (Higg FEM), with a focus on Tier 1 finished product manufacturing and Tier 2 material manufacturing. You’ll gain insights into current decarbonization trends, challenges, and what the data signals about the actions needed to accelerate progress across global supply chains. The speakers are Joël Mertens, Director, Higg Product Tools, Cascale; Quinten Geleijnse, Manager, Higg Product Tools - LCA, Cascale; Cassandra Lindow, Senior Manager, Reporting Tool Analyst, Cascale.\n\n**Organizer**: Cascale\n**Register**: https://connect.cascale.org/login','Apparel & Textiles','webinar','scheduled','en','2026-03-04 07:00:00',NULL,NULL,60,NULL,100,0,NULL,NULL,1,NULL,NULL,NULL,'[\"decarbonization\", \"apparel\", \"textiles\", \"sustainability\"]',NULL,NULL,0,'2026-02-16 15:48:53','2026-02-16 15:48:53',NULL,'standard',NULL,'small',0),(32,1,'CHINAPLAS 2026 国际橡塑展 - 注塑机采购专区','CHINAPLAS 2026 国际橡塑展是亚洲最大的塑料橡胶工业展览会，汇聚全球4600+参展商。本次展会特设注塑机采购专区，展示海天、震雄、伊之密等国内外知名品牌的最新注塑设备。展会将举办供需对接会，为采购商提供一站式采购解决方案。\n\n**展会亮点**：\n- 390,000+ 平方米展览面积\n- 4,600+ 国际参展商\n- 320,000 预计观众\n- 专业采购对接服务\n\n**适合人群**：注塑机采购商、工厂采购经理、设备投资决策者','Injection Molding','webinar','scheduled','zh','2026-04-21 01:00:00',NULL,NULL,240,NULL,5000,0,'procurement_1771258921.126283',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/chinaplas_2026_exhibition.jpg','[\"注塑机\", \"采购对接\", \"CHINAPLAS\", \"橡塑展\", \"设备展会\", \"供应商\"]',NULL,NULL,0,'2026-02-16 16:22:37','2026-02-16 16:22:37',NULL,'standard',NULL,'small',0),(33,1,'2026 华东地区注塑机供需对接会','RealSourcing 平台联合长三角注塑机制造商协会，举办华东地区注塑机供需线上对接会。本次活动邀请20+优质注塑机供应商在线展示产品，提供实时报价和技术咨询服务。\n\n**活动内容**：\n- 供应商产品在线展示\n- 一对一采购洽谈\n- 实时报价与技术支持\n- 采购合同在线签署\n\n**参展品牌**：包括精密注塑机、大型注塑机、全电动注塑机等多种类型设备供应商。\n\n**适合人群**：华东地区制造企业、注塑加工厂、设备采购负责人','Injection Molding','webinar','scheduled','zh','2026-03-15 06:00:00',NULL,NULL,180,NULL,500,0,'procurement_1771258921.126327',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/injection_molding_plant.jpg','[\"注塑机\", \"供需对接\", \"华东地区\", \"在线采购\", \"供应商展示\"]',NULL,NULL,0,'2026-02-16 16:22:37','2026-02-16 16:22:37',NULL,'standard',NULL,'small',0),(34,1,'智能注塑设备采购指南线上研讨会','本次研讨会由 RealSourcing 平台主办，邀请行业专家分享智能注塑设备选型指南，帮助采购商了解如何选择适合自己工厂的注塑机设备。\n\n**研讨内容**：\n- 注塑机选型关键参数解析\n- 全电动 vs 液压注塑机对比\n- 智能化功能与投资回报分析\n- 供应商评估标准与采购流程\n- 设备维护与售后服务要点\n\n**特邀嘉宾**：资深注塑行业顾问、设备工程师、采购专家\n\n**活动形式**：专家分享 + 互动问答 + 供应商推荐\n\n**适合人群**：注塑设备采购新手、工厂技术负责人、投资决策者','Injection Molding','webinar','scheduled','zh','2026-03-25 07:00:00',NULL,NULL,120,NULL,300,0,'procurement_1771258921.126341',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/injection_molding_plant.jpg','[\"注塑机\", \"采购指南\", \"设备选型\", \"智能制造\", \"在线研讨会\"]',NULL,NULL,0,'2026-02-16 16:22:37','2026-02-16 16:22:37',NULL,'standard',NULL,'small',0),(35,62,'2026 国际橡塑展采购对接会','针对高性能材料的专项采购会议，汇聚全球顶尖供应商，为采购商提供一站式解决方案。','Injection Molding','webinar','scheduled','zh','2026-04-15 06:00:00',NULL,NULL,120,NULL,1000,0,'webinar_1771333459784_pqfbyi',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/chinaplas_2026.jpg','[\"橡塑\", \"采购\", \"高性能材料\"]',NULL,NULL,0,'2026-02-17 13:04:19','2026-02-17 13:04:19',NULL,'standard',NULL,'small',0),(36,62,'智能制造与工业4.0技术交流会','探讨智能制造最新技术趋势，分享工业4.0实践案例，助力企业数字化转型。','Automation Equipment','webinar','scheduled','zh','2026-03-20 10:00:00',NULL,NULL,90,NULL,500,0,'webinar_1771333459956_5916if',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/industry_4.0.jpg','[\"智能制造\", \"工业4.0\", \"数字化转型\"]',NULL,NULL,0,'2026-02-17 13:04:19','2026-02-17 13:04:19',NULL,'standard',NULL,'small',0),(37,62,'高精度模具设计与制造技术研讨会','深入探讨模具设计优化、精密加工工艺、质量控制等核心技术。','Injection Molding','webinar','scheduled','zh','2026-05-10 05:00:00',NULL,NULL,120,NULL,300,0,'webinar_1771333460128_4dnqxq',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/mold_design.jpg','[\"模具设计\", \"精密加工\", \"质量控制\"]',NULL,NULL,0,'2026-02-17 13:04:20','2026-02-17 13:04:20',NULL,'standard',NULL,'small',0),(38,62,'新材料应用与创新论坛','聚焦高性能工程塑料、复合材料等新材料的研发与应用，推动材料创新。','Materials R&D','webinar','scheduled','zh','2026-06-05 09:00:00',NULL,NULL,90,NULL,400,0,'webinar_1771333460300_z54kd5',NULL,1,NULL,NULL,'https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/webinar_assets/new_materials.jpg','[\"新材料\", \"工程塑料\", \"材料创新\"]',NULL,NULL,0,'2026-02-17 13:04:20','2026-02-17 13:04:20',NULL,'standard',NULL,'small',0);
/*!40000 ALTER TABLE `webinars` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-17  8:56:17
