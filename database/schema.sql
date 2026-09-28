-- ============================================================================
-- HOTEL PROPERTY MANAGEMENT SYSTEM (PMS) - UNIFIED DATABASE SCHEMA
-- Database Engine: MySQL 8.0+ (InnoDB)
-- File: /database/schema.sql
-- Covers Modules 1 through 6: Rooms, Guests, Reservations, Billing, Cancellation, Housekeeping
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `hotel_pms` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `hotel_pms`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `housekeeping_logs`;
DROP TABLE IF EXISTS `billing_invoices`;
DROP TABLE IF EXISTS `extra_charges`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `guests`;
DROP TABLE IF EXISTS `room_amenities`;
DROP TABLE IF EXISTS `amenities`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `room_types`;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Table: room_types (Module 1)
-- ----------------------------------------------------------------------------
CREATE TABLE `room_types` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `base_rate` DECIMAL(10, 2) NOT NULL CHECK (`base_rate` >= 0),
  `max_capacity` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `description` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: rooms (Module 1)
-- ----------------------------------------------------------------------------
CREATE TABLE `rooms` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `room_number` VARCHAR(20) NOT NULL UNIQUE,
  `room_type_id` INT UNSIGNED NOT NULL,
  `floor_number` INT NOT NULL,
  `status` ENUM('Available', 'Occupied', 'Needs Cleaning', 'Maintenance') NOT NULL DEFAULT 'Available',
  `custom_rate` DECIMAL(10, 2) DEFAULT NULL CHECK (`custom_rate` IS NULL OR `custom_rate` >= 0),
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_rooms_room_type` 
    FOREIGN KEY (`room_type_id`) 
    REFERENCES `room_types` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  INDEX `idx_rooms_status` (`status`),
  INDEX `idx_rooms_floor` (`floor_number`),
  INDEX `idx_rooms_type` (`room_type_id`),
  INDEX `idx_rooms_composite` (`status`, `floor_number`, `room_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: amenities & room_amenities (Module 1)
-- ----------------------------------------------------------------------------
CREATE TABLE `amenities` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `icon_key` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `room_amenities` (
  `room_id` INT UNSIGNED NOT NULL,
  `amenity_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`room_id`, `amenity_id`),
  
  CONSTRAINT `fk_ra_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ra_amenity` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: guests (Module 2)
-- ----------------------------------------------------------------------------
CREATE TABLE `guests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) NOT NULL,
  `id_proof_type` VARCHAR(50) DEFAULT 'Passport',
  `id_proof_number` VARCHAR(100) DEFAULT NULL,
  `special_requests` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_guests_email` (`email`),
  INDEX `idx_guests_name` (`last_name`, `first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: reservations (Module 2, 3, 5)
-- ----------------------------------------------------------------------------
CREATE TABLE `reservations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `guest_id` INT UNSIGNED NOT NULL,
  `room_id` INT UNSIGNED NOT NULL,
  `check_in_date` DATE NOT NULL,
  `check_out_date` DATE NOT NULL,
  `num_guests` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `daily_rate` DECIMAL(10, 2) NOT NULL CHECK (`daily_rate` > 0),
  `total_amount` DECIMAL(10, 2) NOT NULL CHECK (`total_amount` >= 0),
  `status` ENUM('Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  `payment_status` ENUM('Pending', 'Paid', 'Partially_Paid', 'Refunded') NOT NULL DEFAULT 'Pending',
  `cancellation_penalty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `refund_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_res_dates` CHECK (`check_out_date` > `check_in_date`),
  CONSTRAINT `fk_res_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_res_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT,
  
  INDEX `idx_res_overlap` (`room_id`, `check_in_date`, `check_out_date`),
  INDEX `idx_res_guest_status` (`guest_id`, `status`),
  INDEX `idx_res_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: extra_charges (Module 4: Dynamic Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE `extra_charges` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reservation_id` BIGINT UNSIGNED NOT NULL,
  `category` ENUM('Room Service', 'Minibar', 'Spa', 'Laundry', 'Parking', 'Other') NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL CHECK (`amount` >= 0),
  `posted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_ec_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  INDEX `idx_ec_res` (`reservation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: billing_invoices (Module 4)
-- ----------------------------------------------------------------------------
CREATE TABLE `billing_invoices` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `reservation_id` BIGINT UNSIGNED UNIQUE NOT NULL,
  `room_subtotal` DECIMAL(10, 2) NOT NULL,
  `extras_subtotal` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `tax_amount` DECIMAL(10, 2) NOT NULL COMMENT '12% Local Occupancy Tax',
  `service_fee` DECIMAL(10, 2) NOT NULL COMMENT '5% Service Fee',
  `grand_total` DECIMAL(10, 2) NOT NULL,
  `is_paid` TINYINT(1) NOT NULL DEFAULT 0,
  `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_inv_res` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: housekeeping_logs (Module 6)
-- ----------------------------------------------------------------------------
CREATE TABLE `housekeeping_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `room_id` INT UNSIGNED NOT NULL,
  `task_type` ENUM('Routine Clean', 'Deep Clean', 'Turn Down', 'Repair/Maintenance') NOT NULL,
  `status` ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  `assigned_staff_name` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `reported_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  
  CONSTRAINT `fk_hk_rooms` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  INDEX `idx_hk_room_status` (`room_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO `room_types` (`id`, `name`, `slug`, `base_rate`, `max_capacity`, `description`) VALUES
(1, 'Standard Room', 'standard', 120.00, 2, 'Cozy room with queen bed and modern amenities.'),
(2, 'Deluxe Room', 'deluxe', 180.00, 3, 'Spacious room with king bed and balcony.'),
(3, 'Executive Suite', 'executive', 250.00, 4, 'Executive suite with lounge access.'),
(4, 'Presidential Suite', 'presidential', 850.00, 6, 'Luxury suite with plunge pool and panoramic views.');

INSERT INTO `rooms` (`id`, `room_number`, `room_type_id`, `floor_number`, `status`, `custom_rate`) VALUES
(1, '101', 1, 1, 'Available', NULL),
(2, '102', 1, 1, 'Occupied', NULL),
(3, '103', 2, 1, 'Needs Cleaning', 190.00),
(4, '104', 2, 1, 'Available', NULL),
(5, '201', 3, 2, 'Occupied', NULL),
(6, '202', 3, 2, 'Maintenance', NULL),
(7, '203', 3, 2, 'Occupied', 270.00),
(8, '301', 4, 3, 'Needs Cleaning', NULL);

INSERT INTO `guests` (`id`, `first_name`, `last_name`, `email`, `phone`) VALUES
(1, 'Eleanor', 'Vance', 'eleanor@vance.com', '+1 555-0192'),
(2, 'Marcus', 'Sterling', 'marcus@sterling.org', '+1 555-0341'),
(3, 'Sophia', 'Chen', 'sophia.chen@tech.co', '+1 555-0812');

INSERT INTO `reservations` (`id`, `booking_reference`, `guest_id`, `room_id`, `check_in_date`, `check_out_date`, `num_guests`, `daily_rate`, `total_amount`, `status`, `payment_status`) VALUES
(1001, 'RES-1001', 1, 2, '2026-09-27', '2026-09-30', 2, 120.00, 360.00, 'Checked-In', 'Paid'),
(1002, 'RES-1002', 2, 5, '2026-09-28', '2026-10-02', 2, 250.00, 1000.00, 'Checked-In', 'Pending'),
(1003, 'RES-1003', 3, 7, '2026-09-28', '2026-10-01', 3, 270.00, 810.00, 'Confirmed', 'Paid');

INSERT INTO `extra_charges` (`reservation_id`, `category`, `description`, `amount`) VALUES
(1001, 'Room Service', 'Gourmet Breakfast', 45.00),
(1001, 'Minibar', 'Wine & Snacks', 65.00),
(1002, 'Spa', 'Deep Tissue Massage', 140.00);

INSERT INTO `housekeeping_logs` (`room_id`, `task_type`, `status`, `assigned_staff_name`, `notes`) VALUES
(3, 'Turn Down', 'Pending', 'Maria Santos', 'Check-out clean required'),
(8, 'Deep Clean', 'Pending', 'Carlos Ruiz', 'VIP arrival prep');
