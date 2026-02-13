-- RTM Messages table (消息持久化)
CREATE TABLE IF NOT EXISTS `rtm_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `senderId` INT NOT NULL,
  `receiverId` INT NULL,
  `channelName` VARCHAR(255) NULL,
  `messageType` ENUM('private', 'channel') NOT NULL DEFAULT 'private',
  `contentType` ENUM('text', 'image', 'file') NOT NULL DEFAULT 'text',
  `content` TEXT NOT NULL,
  `metadata` JSON NULL,
  `isRead` INT NOT NULL DEFAULT 0,
  `readAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sender` (`senderId`),
  INDEX `idx_receiver` (`receiverId`),
  INDEX `idx_channel` (`channelName`),
  INDEX `idx_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RTM Conversations table (会话列表)
CREATE TABLE IF NOT EXISTS `rtm_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `targetUserId` INT NULL,
  `channelName` VARCHAR(255) NULL,
  `conversationType` ENUM('private', 'channel') NOT NULL DEFAULT 'private',
  `lastMessageId` INT NULL,
  `lastMessageContent` TEXT NULL,
  `lastMessageAt` TIMESTAMP NULL,
  `unreadCount` INT NOT NULL DEFAULT 0,
  `isPinned` INT NOT NULL DEFAULT 0,
  `isMuted` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`userId`),
  INDEX `idx_target` (`targetUserId`),
  INDEX `idx_channel` (`channelName`),
  INDEX `idx_updated` (`updatedAt`),
  UNIQUE KEY `unique_conversation` (`userId`, `targetUserId`, `channelName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
