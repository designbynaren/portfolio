import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const clientReviews = sqliteTable("client_reviews", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull(),
  name: text("name").notNull(),
  project: text("project").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [
  uniqueIndex("client_reviews_author_unique").on(table.authorId),
  check("client_reviews_rating_range", sql`${table.rating} BETWEEN 1 AND 5`),
]);
