ALTER TABLE `classes` ADD `week_number` integer;--> statement-breakpoint
ALTER TABLE `classes` ADD `year` integer;--> statement-breakpoint
CREATE INDEX `idx_classes_week_year` ON `classes` (`week_number`,`year`);