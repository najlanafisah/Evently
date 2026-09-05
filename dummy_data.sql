-- ==============================================================================
-- DATABASE INITIALIZATION & DUMMY DATA SCRIPT
-- Project: Event Management SaaS (Evently)
-- Generated from: assets/js/data.js & doc/PRD.md
-- Compatible with: MySQL 8.0+ / MariaDB 10.4+
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DATABASE SETUP (Optional)
-- ------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `event_management`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `event_management`;

-- ------------------------------------------------------------------------------
-- 2. DROP TABLES IF EXIST (Order matters due to foreign keys)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `attendances`;
DROP TABLE IF EXISTS `activities`;
DROP TABLE IF EXISTS `registrants`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------------------------
-- 3. TABLE DEFINITIONS (DDL)
-- ------------------------------------------------------------------------------

-- Users / Administrators Table (From App Shell profile: "Lala, Administrator")
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Administrator',
  `avatar` VARCHAR(10) DEFAULT 'LA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events Table
CREATE TABLE `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `quota` INT NOT NULL DEFAULT 0,
  `status` ENUM('Draft', 'Published', 'Ongoing', 'Completed', 'Archived') NOT NULL DEFAULT 'Draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrants Table
CREATE TABLE `registrants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_registrants_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_registrants_event_id` (`event_id`),
  INDEX `idx_registrants_email` (`email`),
  INDEX `idx_registrants_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendances / Presensi Table
CREATE TABLE `attendances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `registrant_id` INT NOT NULL,
  `status` ENUM('Belum Hadir', 'Hadir', 'Terlambat') NOT NULL DEFAULT 'Belum Hadir',
  `check_in_time` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_attendances_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_attendances_registrant`
    FOREIGN KEY (`registrant_id`) REFERENCES `registrants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_event_registrant` (`event_id`, `registrant_id`),
  INDEX `idx_attendances_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities Table (Dashboard Activity Log)
CREATE TABLE `activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT DEFAULT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_activities_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_activities_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------------------------
-- 4. INSERT DUMMY DATA (DML)
-- ------------------------------------------------------------------------------

-- Insert Admin User
INSERT INTO `users` (`id`, `name`, `email`, `role`, `avatar`, `created_at`) VALUES
(1, 'Lala', 'lala@evently.com', 'Administrator', 'LA', '2026-09-01 08:00:00');

-- Insert Events (from assets/js/data.js)
INSERT INTO `events` (`id`, `name`, `date`, `location`, `quota`, `status`, `created_at`) VALUES
(1, 'Product Design Summit', '2026-09-18', 'Jakarta Convention Center', 400, 'Published', '2026-09-01 09:00:00'),
(2, 'Frontend Engineering Day', '2026-09-24', 'Online Event', 200, 'Published', '2026-09-01 09:30:00'),
(3, 'Internal Team Gathering', '2026-10-02', 'Bogor, West Java', 60, 'Draft', '2026-09-02 11:00:00');

-- Insert Registrants (from assets/js/data.js & views.js form structure)
INSERT INTO `registrants` (`id`, `event_id`, `name`, `email`, `phone`, `notes`, `status`, `registered_at`) VALUES
(1, 1, 'Alya Putri', 'alya@example.com', '+628123456789', 'Memerlukan sertifikat kehadiran', 'Confirmed', '2026-09-02 10:15:00'),
(2, 2, 'Raka Pratama', 'raka@example.com', '+628987654321', NULL, 'Confirmed', '2026-09-03 14:20:00'),
(3, 1, 'Nadia Zahra', 'nadia@example.com', '+628112233445', 'Mengikuti sesi offline', 'Pending', '2026-09-04 09:45:00');

-- Insert Attendances (matching registrant sample and PRD statuses)
INSERT INTO `attendances` (`id`, `event_id`, `registrant_id`, `status`, `check_in_time`) VALUES
(1, 1, 1, 'Hadir', '2026-09-18 08:45:00'),
(2, 2, 2, 'Belum Hadir', NULL),
(3, 1, 3, 'Belum Hadir', NULL);

-- Insert Recent Activities (from assets/js/data.js)
INSERT INTO `activities` (`id`, `event_id`, `message`, `created_at`) VALUES
(1, 1, 'Event Product Design Summit diperbarui', '2026-09-05 08:30:00'),
(2, 2, 'Pendaftar baru masuk untuk Frontend Engineering Day', '2026-09-05 10:15:00'),
(3, 1, 'Presensi Product Design Summit mencapai 72%', '2026-09-05 12:00:00');

-- ------------------------------------------------------------------------------
-- 5. USEFUL VIEWS (Optional helper for query dashboard & reporting)
-- ------------------------------------------------------------------------------

-- View: Event Summary (Dynamic registrant count vs quota)
CREATE OR REPLACE VIEW `v_event_summary` AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.date AS event_date,
  e.location,
  e.quota,
  e.status,
  COUNT(r.id) AS total_registrants,
  (e.quota - COUNT(r.id)) AS remaining_quota,
  COUNT(CASE WHEN r.status = 'Confirmed' THEN 1 END) AS confirmed_registrants
FROM `events` e
LEFT JOIN `registrants` r ON e.id = r.event_id
GROUP BY e.id, e.name, e.date, e.location, e.quota, e.status;
