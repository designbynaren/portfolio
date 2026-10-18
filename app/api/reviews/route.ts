import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { findMyReview, listReviews, removeMyReview, saveReview } from "@/lib/review-service";
import { reviewInput } from "@/lib/review-validation";

export const dynamic = "force-dynamic";
const noCache = { "Cache-Control": "no-store" };
function json(value: unknown, status = 200) { return Response.json(value, { status, headers: noCache }); }
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return request.headers.get("sec-fetch-site") !== "cross-site" && (!origin || origin === new URL(request.url).origin);
}
export async function GET() {
  try {
    const user = await getChatGPTUser();
    const db = getDb();
    const [reviews, mine] = await Promise.all([listReviews(db), user ? findMyReview(db, user.userId) : Promise.resolve(null)]);
    return json({ reviews, mine });
  } catch (error) {
    console.error("Review loading failed", error);
    return json({ error: "Reviews couldn’t load. Please try again." }, 503);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Please submit from this website." }, 403);
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in to leave your review.", signInUrl: chatGPTSignInPath("/#leave-review") }, 401);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Invalid submission format." }, 415);
  if (Number(request.headers.get("content-length")) > 12000) return json({ error: "This review is too long." }, 413);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "This review is too long." }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: "Please check your review and try again." }, 400); }
  const parsed = reviewInput.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 400);
  try { return json({ review: await saveReview(getDb(), user.userId, parsed.data) }); }
  catch (error) {
    console.error("Review saving failed", error);
    return json({ error: "Your review wasn’t saved. Please try again." }, 503);
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Please submit from this website." }, 403);
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Please sign in first." }, 401);
  try { await removeMyReview(getDb(), user.userId); return json({ ok: true }); }
  catch (error) { console.error("Review removal failed", error); return json({ error: "Your review couldn’t be removed. Please try again." }, 503); }
}
