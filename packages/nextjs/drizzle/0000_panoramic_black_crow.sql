CREATE TABLE `student_cert` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` text NOT NULL,
	`institution` text NOT NULL,
	`degree` text NOT NULL,
	`field_of_study` text NOT NULL,
	`issue_date` text NOT NULL,
	`document_hash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text,
	`wallet_address` text,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`phone_number` text,
	`profile_image` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_student_id_unique` ON `students` (`student_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_wallet_address_unique` ON `students` (`wallet_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_email_unique` ON `students` (`email`);