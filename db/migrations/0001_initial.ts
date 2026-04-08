export default "CREATE TABLE IF NOT EXISTS `wedding` (
  `id` integer PRIMARY KEY NOT NULL,
  `partner1_name` text,
  `partner2_name` text,
  `wedding_date` text,
  `venue_name` text,
  `budget_target` real,
  `currency` text DEFAULT 'EUR',
  `created_at` text,
  `updated_at` text
);

CREATE TABLE IF NOT EXISTS `tables` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `capacity` integer,
  `notes` text
);

CREATE TABLE IF NOT EXISTS `guests` (
  `id` text PRIMARY KEY NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `side` text,
  `invitation_type` text NOT NULL,
  `rsvp_status` text DEFAULT 'PENDING',
  `rsvp_date` text,
  `is_sleeping` integer DEFAULT 0,
  `is_child` integer DEFAULT 0,
  `diet` text DEFAULT 'STANDARD',
  `diet_notes` text,
  `table_id` text REFERENCES `tables`(`id`),
  `email` text,
  `phone` text,
  `address` text,
  `notes` text,
  `created_at` text,
  `updated_at` text
);

CREATE TABLE IF NOT EXISTS `vendors` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `name` text NOT NULL,
  `contact_name` text,
  `phone` text,
  `email` text,
  `website` text,
  `status` text DEFAULT 'PROSPECT',
  `quote_date` text,
  `event_date` text,
  `base_price` real,
  `price_per_person` real,
  `ppp_source` text,
  `deposit_amount` real,
  `deposit_paid` integer DEFAULT 0,
  `deposit_due_date` text,
  `balance_due_date` text,
  `validity_date` text,
  `custom_fields` text,
  `notes` text,
  `rating` integer DEFAULT 0,
  `created_at` text,
  `updated_at` text
);

CREATE TABLE IF NOT EXISTS `quote_pricing` (
  `id` text PRIMARY KEY NOT NULL,
  `vendor_id` text NOT NULL REFERENCES `vendors`(`id`) ON DELETE CASCADE,
  `pricing_key` text NOT NULL,
  `price_per_person` real,
  `guest_count_override` integer,
  `forfait_personnel` real,
  `forfait_deplacement` real
);

CREATE TABLE IF NOT EXISTS `task_categories` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `icon` text,
  `color` text,
  `sort_order` integer
);

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `category_id` text REFERENCES `task_categories`(`id`),
  `title` text NOT NULL,
  `description` text,
  `status` text DEFAULT 'TODO',
  `priority` text DEFAULT 'MEDIUM',
  `due_date` text,
  `months_before` integer,
  `is_system` integer DEFAULT 0,
  `vendor_id` text REFERENCES `vendors`(`id`),
  `reminder_days_before` integer,
  `completed_at` text,
  `notes` text,
  `created_at` text,
  `updated_at` text
);

CREATE TABLE IF NOT EXISTS `idea_collections` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `cover_idea_id` text,
  `sort_order` integer,
  `created_at` text,
  `updated_at` text
);

CREATE TABLE IF NOT EXISTS `ideas` (
  `id` text PRIMARY KEY NOT NULL,
  `collection_id` text REFERENCES `idea_collections`(`id`),
  `title` text,
  `notes` text,
  `image_uri` text,
  `image_thumbnail_uri` text,
  `source_url` text,
  `tags` text,
  `category` text,
  `vendor_id` text REFERENCES `vendors`(`id`),
  `is_favorite` integer DEFAULT 0,
  `color_palette` text,
  `created_at` text,
  `updated_at` text
);

-- Insert singleton wedding row
INSERT OR IGNORE INTO `wedding` (`id`, `currency`, `created_at`, `updated_at`)
VALUES (1, 'EUR', datetime('now'), datetime('now'));
";
