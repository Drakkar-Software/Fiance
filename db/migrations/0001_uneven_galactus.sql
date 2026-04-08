CREATE TABLE `accommodations` (
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
--> statement-breakpoint
CREATE TABLE `day_of_items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`time` text NOT NULL,
	`end_time` text,
	`location` text,
	`responsible` text,
	`notes` text,
	`is_public` integer DEFAULT false,
	`sort_order` integer,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `gifts` (
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
--> statement-breakpoint
CREATE TABLE `guest_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `vendor_payments` (
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
--> statement-breakpoint
DROP TABLE `jour_j_items`;--> statement-breakpoint
ALTER TABLE `quote_pricing` RENAME COLUMN `forfait_personnel` TO `staff_fee`;--> statement-breakpoint
ALTER TABLE `quote_pricing` RENAME COLUMN `forfait_deplacement` TO `travel_fee`;--> statement-breakpoint
ALTER TABLE `guests` ADD `group_id` text REFERENCES guest_groups(id);--> statement-breakpoint
ALTER TABLE `guests` ADD `companion_id` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `gift_description` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `thank_you_sent` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `guests` ADD `thank_you_sent_date` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `accommodation_id` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `room_number` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `rsvp_token` text;--> statement-breakpoint
ALTER TABLE `tables` ADD `position_x` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tables` ADD `position_y` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tables` ADD `shape` text DEFAULT 'round';--> statement-breakpoint
ALTER TABLE `wedding` ADD `description` text;--> statement-breakpoint
ALTER TABLE `wedding` ADD `faq` text;--> statement-breakpoint
ALTER TABLE `wedding` ADD `category_budgets` text;--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/