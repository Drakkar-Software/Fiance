-- New tables
CREATE TABLE IF NOT EXISTS `accommodations` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `address` text,
  `phone` text,
  `website` text,
  `check_in_date` text,
  `check_out_date` text,
  `room_count` integer,
  `price_per_night` real,
  `notes` text,
  `created_at` text,
  `updated_at` text
);
CREATE TABLE IF NOT EXISTS `gifts` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `price` real,
  `url` text,
  `image_url` text,
  `category` text,
  `claimed` integer DEFAULT false,
  `claimed_by_name` text,
  `claimed_at` text,
  `sort_order` integer DEFAULT 0,
  `created_at` text,
  `updated_at` text
);
CREATE TABLE IF NOT EXISTS `guest_groups` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `created_at` text,
  `updated_at` text
);
CREATE TABLE IF NOT EXISTS `vendor_payments` (
  `id` text PRIMARY KEY NOT NULL,
  `vendor_id` text NOT NULL,
  `amount` real NOT NULL,
  `paid_date` text NOT NULL,
  `due_date` text,
  `method` text,
  `label` text,
  `notes` text,
  `created_at` text,
  `updated_at` text,
  FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE cascade
);

-- New guest columns
ALTER TABLE `guests` ADD COLUMN `group_id` text REFERENCES guest_groups(id);
ALTER TABLE `guests` ADD COLUMN `gift_description` text;
ALTER TABLE `guests` ADD COLUMN `thank_you_sent` integer DEFAULT false;
ALTER TABLE `guests` ADD COLUMN `thank_you_sent_date` text;
ALTER TABLE `guests` ADD COLUMN `accommodation_id` text;
ALTER TABLE `guests` ADD COLUMN `room_number` text;
ALTER TABLE `guests` ADD COLUMN `rsvp_token` text;

-- New tables columns
ALTER TABLE `tables` ADD COLUMN `position_x` real DEFAULT 0;
ALTER TABLE `tables` ADD COLUMN `position_y` real DEFAULT 0;
ALTER TABLE `tables` ADD COLUMN `shape` text DEFAULT 'round';

-- New wedding column
ALTER TABLE `wedding` ADD COLUMN `category_budgets` text;
