-- =============================================================================
-- Voice2Growth - Production MySQL Database Schema
-- Standard: MySQL 8.0+ / InnoDB / utf8mb4_unicode_ci
-- "Every Voice Can Create Change"
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `mobile_number` VARCHAR(20) NOT NULL UNIQUE,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `role` ENUM('user', 'org_admin', 'admin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'suspended', 'deactivated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_mobile` (`mobile_number`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `age_group` VARCHAR(30) NOT NULL,
  `category` ENUM('Individual', 'School', 'College', 'Professional', 'Business / Outlet', 'Community', 'Other') NOT NULL,
  `custom_category` VARCHAR(100) NULL,
  `city` VARCHAR(100) NOT NULL,
  `school_college_org` VARCHAR(200) NULL,
  `profession` VARCHAR(150) NULL,
  `is_anonymous` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_profiles_user_id` (`user_id`),
  INDEX `idx_user_profiles_category` (`category`),
  INDEX `idx_user_profiles_city` (`city`),
  CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. OTP Verifications Table (Salted SHA-256)
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` VARCHAR(36) NOT NULL,
  `mobile_number` VARCHAR(20) NOT NULL,
  `otp_hash` VARCHAR(128) NOT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `max_attempts` INT NOT NULL DEFAULT 3,
  `expires_at` BIGINT NOT NULL,
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_otp_mobile` (`mobile_number`),
  INDEX `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Organizations Table
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `category` ENUM('School', 'College', 'Business', 'Outlet', 'Community', 'Organization') NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `contact_email` VARCHAR(150) NULL,
  `is_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_organizations_category` (`category`),
  INDEX `idx_organizations_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Outlets Table
CREATE TABLE IF NOT EXISTS `outlets` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_outlets_org` (`organization_id`),
  CONSTRAINT `fk_outlets_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Topics Table
CREATE TABLE IF NOT EXISTS `topics` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  INDEX `idx_topics_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Opinions Table
CREATE TABLE IF NOT EXISTS `opinions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `topic_id` VARCHAR(36) NOT NULL,
  `current_opinion` MEDIUMTEXT NOT NULL,
  `previous_opinion` MEDIUMTEXT NULL,
  `was_different` ENUM('Yes', 'No', 'Not Sure') NOT NULL DEFAULT 'No',
  `confidence_score` INT NOT NULL DEFAULT 85,
  `visibility` ENUM('public', 'anonymous', 'private') NOT NULL DEFAULT 'public',
  `status` ENUM('published', 'under_review', 'flagged') NOT NULL DEFAULT 'published',
  `upvotes` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_opinions_user` (`user_id`),
  INDEX `idx_opinions_topic` (`topic_id`),
  INDEX `idx_opinions_status` (`status`),
  CONSTRAINT `fk_opinions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_opinions_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Opinion Changes Table
CREATE TABLE IF NOT EXISTS `opinion_changes` (
  `id` VARCHAR(36) NOT NULL,
  `opinion_id` VARCHAR(36) NOT NULL,
  `factor` VARCHAR(100) NOT NULL,
  `explanation` MEDIUMTEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_opinion_changes_opinion` (`opinion_id`),
  CONSTRAINT `fk_opinion_changes_opinion` FOREIGN KEY (`opinion_id`) REFERENCES `opinions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Suggestions Table ("Suggest a Change" Workflow)
CREATE TABLE IF NOT EXISTS `suggestions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `target_organization_id` VARCHAR(36) NULL,
  `what_should_change` MEDIUMTEXT NOT NULL,
  `why_change` MEDIUMTEXT NOT NULL,
  `beneficiaries` VARCHAR(255) NOT NULL,
  `implementation_plan` MEDIUMTEXT NOT NULL,
  `expected_impact` MEDIUMTEXT NOT NULL,
  `status` ENUM('Submitted', 'Under Review', 'Shortlisted', 'In Discussion', 'Accepted', 'Implemented') NOT NULL DEFAULT 'Submitted',
  `visibility` ENUM('public', 'anonymous') NOT NULL DEFAULT 'public',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_suggestions_user` (`user_id`),
  INDEX `idx_suggestions_org` (`target_organization_id`),
  CONSTRAINT `fk_suggestions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Ideas Table
CREATE TABLE IF NOT EXISTS `ideas` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `problem_description` MEDIUMTEXT NOT NULL,
  `proposed_solution` MEDIUMTEXT NOT NULL,
  `target_audience` VARCHAR(255) NOT NULL,
  `expected_benefit` MEDIUMTEXT NOT NULL,
  `expected_impact` MEDIUMTEXT NOT NULL,
  `required_resources` MEDIUMTEXT NULL,
  `status` ENUM('Submitted', 'Under Review', 'Shortlisted', 'In Discussion', 'Accepted', 'Implemented') NOT NULL DEFAULT 'Submitted',
  `visibility` ENUM('public', 'anonymous') NOT NULL DEFAULT 'public',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ideas_user` (`user_id`),
  INDEX `idx_ideas_status` (`status`),
  CONSTRAINT `fk_ideas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Idea Status History
CREATE TABLE IF NOT EXISTS `idea_status_history` (
  `id` VARCHAR(36) NOT NULL,
  `idea_id` VARCHAR(36) NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `notes` TEXT NULL,
  `updated_by_user_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status_history_idea` (`idea_id`),
  CONSTRAINT `fk_status_history_idea` FOREIGN KEY (`idea_id`) REFERENCES `ideas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Business & Outlet Feedback Table
CREATE TABLE IF NOT EXISTS `business_feedback` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `business_name` VARCHAR(150) NOT NULL,
  `outlet_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `what_liked` TEXT NOT NULL,
  `what_disliked` TEXT NOT NULL,
  `what_should_improve` TEXT NOT NULL,
  `what_introduce` TEXT NOT NULL,
  `growth_suggestion` MEDIUMTEXT NOT NULL,
  `business_impact` JSON NOT NULL,
  `status` ENUM('Received', 'Reviewed', 'Action Planned', 'Resolved') NOT NULL DEFAULT 'Received',
  `visibility` ENUM('public', 'anonymous') NOT NULL DEFAULT 'public',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_biz_user` (`user_id`),
  INDEX `idx_biz_name` (`business_name`),
  CONSTRAINT `fk_biz_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Community Ideas Table
CREATE TABLE IF NOT EXISTS `community_ideas` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `topic_category` VARCHAR(100) NOT NULL,
  `problem` MEDIUMTEXT NOT NULL,
  `proposed_solution` MEDIUMTEXT NOT NULL,
  `target_community` VARCHAR(255) NOT NULL,
  `expected_benefit` MEDIUMTEXT NOT NULL,
  `required_resources` MEDIUMTEXT NOT NULL,
  `expected_impact` MEDIUMTEXT NOT NULL,
  `status` ENUM('Submitted', 'Under Review', 'Shortlisted', 'In Discussion', 'Accepted', 'Implemented') NOT NULL DEFAULT 'Submitted',
  `visibility` ENUM('public', 'anonymous') NOT NULL DEFAULT 'public',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_comm_user` (`user_id`),
  CONSTRAINT `fk_comm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Technology Ideas Table
CREATE TABLE IF NOT EXISTS `technology_ideas` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `problem` MEDIUMTEXT NOT NULL,
  `current_process` MEDIUMTEXT NOT NULL,
  `proposed_technology` MEDIUMTEXT NOT NULL,
  `automation_opportunity` MEDIUMTEXT NOT NULL,
  `expected_benefit` MEDIUMTEXT NOT NULL,
  `estimated_complexity` ENUM('Low', 'Medium', 'High', 'Enterprise') NOT NULL DEFAULT 'Medium',
  `status` ENUM('Submitted', 'Under Review', 'Shortlisted', 'In Discussion', 'Accepted', 'Implemented') NOT NULL DEFAULT 'Submitted',
  `visibility` ENUM('public', 'anonymous') NOT NULL DEFAULT 'public',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tech_user` (`user_id`),
  CONSTRAINT `fk_tech_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. User Consents Table
CREATE TABLE IF NOT EXISTS `user_consents` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `keep_anonymous` BOOLEAN NOT NULL DEFAULT FALSE,
  `allow_public_display` BOOLEAN NOT NULL DEFAULT TRUE,
  `allow_aggregated_insights` BOOLEAN NOT NULL DEFAULT TRUE,
  `agreed_to_rules` BOOLEAN NOT NULL DEFAULT TRUE,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_consents_user` (`user_id`),
  CONSTRAINT `fk_user_consents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Content Reports Table
CREATE TABLE IF NOT EXISTS `content_reports` (
  `id` VARCHAR(36) NOT NULL,
  `reporter_user_id` VARCHAR(36) NOT NULL,
  `target_type` ENUM('opinion', 'idea', 'suggestion', 'user') NOT NULL,
  `target_id` VARCHAR(36) NOT NULL,
  `reason` VARCHAR(150) NOT NULL,
  `details` TEXT NULL,
  `status` ENUM('Pending', 'Reviewed', 'Dismissed', 'Action Taken') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reports_target` (`target_type`, `target_id`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(36) NOT NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('status_change', 'community_vote', 'review_update', 'system') NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
