-- Migrate DINNER invitation type to FULL
UPDATE `guests` SET `invitation_type` = 'FULL' WHERE `invitation_type` = 'DINNER';

-- Rename NEXT_DAY to BOTH_DAYS
UPDATE `guests` SET `invitation_type` = 'BOTH_DAYS' WHERE `invitation_type` = 'NEXT_DAY';

-- Migrate vendor ppp_source values
UPDATE `vendors` SET `ppp_source` = 'FULL' WHERE `ppp_source` = 'DINNER';
UPDATE `vendors` SET `ppp_source` = 'BOTH_DAYS' WHERE `ppp_source` = 'NEXT_DAY';

-- Migrate quote_pricing ppp_source values
UPDATE `quote_pricing` SET `ppp_source` = 'FULL' WHERE `ppp_source` = 'DINNER';
UPDATE `quote_pricing` SET `ppp_source` = 'BOTH_DAYS' WHERE `ppp_source` = 'NEXT_DAY';

-- Create guest groups table
CREATE TABLE IF NOT EXISTS `guest_groups` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `created_at` text,
  `updated_at` text
);

-- Add group_id column to guests
ALTER TABLE `guests` ADD COLUMN `group_id` text REFERENCES `guest_groups`(`id`);
