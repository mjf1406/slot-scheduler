CREATE TABLE `classes` (
	`class_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`timetable_id` text NOT NULL,
	`linked_class` text,
	`name` text NOT NULL,
	`default_day` text,
	`default_start` text,
	`default_end` text,
	`day` text,
	`start` text,
	`end` text,
	`color` text NOT NULL,
	`icon_name` text NOT NULL,
	`icon_prefix` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`timetable_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_class`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `slot_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`timetable_id` text NOT NULL,
	`slot_id` text,
	`class_id` text NOT NULL,
	`week_number` integer NOT NULL,
	`year` integer NOT NULL,
	`size` text NOT NULL,
	`text` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`timetable_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`slot_id`) REFERENCES `slots`(`slot_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `slots` (
	`user_id` text NOT NULL,
	`timetable_id` text NOT NULL,
	`slot_id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`timetable_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`user_id` text NOT NULL,
	`timetable_id` text PRIMARY KEY NOT NULL,
	`days` text NOT NULL,
	`name` text NOT NULL,
	`slots` text DEFAULT '[]',
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`user_email` text NOT NULL,
	`user_role` text,
	`joined_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `classes_by_user_id` ON `classes` (`user_id`);--> statement-breakpoint
CREATE INDEX `slot_classes_timetable_idx` ON `slot_classes` (`timetable_id`);--> statement-breakpoint
CREATE INDEX `slot_classes_slot_idx` ON `slot_classes` (`slot_id`);--> statement-breakpoint
CREATE INDEX `slot_classes_class_idx` ON `slot_classes` (`class_id`);--> statement-breakpoint
CREATE INDEX `slot_classes_week_year_idx` ON `slot_classes` (`week_number`,`year`);--> statement-breakpoint
CREATE INDEX `slot_classes_slot_week_year_idx` ON `slot_classes` (`slot_id`,`week_number`,`year`);--> statement-breakpoint
CREATE INDEX `slot_classes_class_week_year_idx` ON `slot_classes` (`class_id`,`week_number`,`year`);--> statement-breakpoint
CREATE INDEX `slots_by_user_id` ON `slots` (`user_id`);--> statement-breakpoint
CREATE INDEX `timetables_by_user_id` ON `timetables` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_email_unique` ON `users` (`user_email`);