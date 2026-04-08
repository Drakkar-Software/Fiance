export default "CREATE TABLE IF NOT EXISTS `agenda_events` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `date` text NOT NULL,
  `time` text,
  `end_time` text,
  `location` text,
  `vendor_id` text REFERENCES `vendors`(`id`),
  `notes` text,
  `created_at` text,
  `updated_at` text
);

ALTER TABLE `tasks` ADD COLUMN `assignee` text;

CREATE TABLE IF NOT EXISTS `jour_j_items` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `time` text NOT NULL,
  `end_time` text,
  `location` text,
  `responsible` text,
  `notes` text,
  `sort_order` integer,
  `created_at` text,
  `updated_at` text
);
";
