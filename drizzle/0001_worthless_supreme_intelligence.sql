CREATE TABLE `factories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`category` varchar(100),
	`status` enum('pending','verified','suspended') NOT NULL DEFAULT 'pending',
	`overallScore` int DEFAULT 0,
	`qualityScore` int DEFAULT 0,
	`deliveryScore` int DEFAULT 0,
	`communicationScore` int DEFAULT 0,
	`pricingScore` int DEFAULT 0,
	`complianceScore` int DEFAULT 0,
	`employees` varchar(50),
	`annualRevenue` varchar(100),
	`established` varchar(10),
	`website` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`certifications` json,
	`specialties` json,
	`aiSummary` text,
	`addedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `factories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `negotiation_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webinarId` int NOT NULL,
	`type` enum('system','factory','presentation','pricing','ai_insight','negotiation','ai_alert','agreement') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `negotiation_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webinarId` int,
	`factoryId` int NOT NULL,
	`buyerId` int NOT NULL,
	`product` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalValue` decimal(12,2) NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`terms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('supplier_evaluation','profit_analysis','negotiation_summary') NOT NULL DEFAULT 'supplier_evaluation',
	`webinarId` int,
	`content` text,
	`aiAnalysis` text,
	`status` enum('generating','completed','failed') NOT NULL DEFAULT 'generating',
	`factoriesAnalyzed` int DEFAULT 0,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webinar_factories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webinarId` int NOT NULL,
	`factoryId` int NOT NULL,
	`role` enum('presenter','participant') NOT NULL DEFAULT 'participant',
	`status` enum('invited','accepted','declined','joined') NOT NULL DEFAULT 'invited',
	`joinedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webinar_factories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webinar_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webinarId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`uploadedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webinar_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webinars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','scheduled','live','completed','archived') NOT NULL DEFAULT 'draft',
	`category` varchar(100),
	`language` varchar(10) DEFAULT 'en',
	`scheduledAt` timestamp,
	`duration` int DEFAULT 60,
	`createdById` int NOT NULL,
	`workSpec` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webinars_id` PRIMARY KEY(`id`)
);
