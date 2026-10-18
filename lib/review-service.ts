import { desc, eq } from "drizzle-orm";
import { clientReviews } from "../db/schema";
import type { getDb } from "../db";
import type { ReviewInput } from "./review-validation";

type Database = ReturnType<typeof getDb>;
// Never include account identifiers or emails in the visible review data.
const publicFields = {
  id: clientReviews.id, name: clientReviews.name, project: clientReviews.project,
  rating: clientReviews.rating, comment: clientReviews.comment,
  createdAt: clientReviews.createdAt, updatedAt: clientReviews.updatedAt,
};
export function listReviews(db: Database) {
  return db.select(publicFields).from(clientReviews).orderBy(desc(clientReviews.updatedAt)).limit(60);
}
export async function findMyReview(db: Database, authorId: string) {
  const rows = await db.select(publicFields).from(clientReviews).where(eq(clientReviews.authorId, authorId)).limit(1);
  return rows[0] ?? null;
}
export async function saveReview(db: Database, authorId: string, input: ReviewInput) {
  const now = new Date().toISOString();
  const fields = { name: input.name, project: input.project, rating: input.rating, comment: input.comment, updatedAt: now };
  const rows = await db.insert(clientReviews).values({ id: crypto.randomUUID(), authorId, createdAt: now, ...fields })
    .onConflictDoUpdate({ target: clientReviews.authorId, set: fields }).returning(publicFields);
  return rows[0];
}
export async function removeMyReview(db: Database, authorId: string) {
  await db.delete(clientReviews).where(eq(clientReviews.authorId, authorId));
}
