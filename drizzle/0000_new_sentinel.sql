CREATE TABLE `client_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`name` text NOT NULL,
	`project` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "client_reviews_rating_range" CHECK("client_reviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_reviews_author_unique` ON `client_reviews` (`author_id`);