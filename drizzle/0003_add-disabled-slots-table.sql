CREATE TABLE `disabled_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`slot_id` text NOT NULL,
	`disable_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`slot_id`) REFERENCES `slots`(`slot_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `disabled_slots_slot_date_idx` ON `disabled_slots` (`slot_id`,`disable_date`);