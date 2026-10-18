"use client";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, MessageSquare, Send, Star, Trash2 } from "lucide-react";
import { reviewInput, type ClientReview } from "@/lib/review-validation";

type Props = { onReviews: (reviews: ClientReview[]) => void };
type ReviewList = { reviews: ClientReview[]; mine: ClientReview | null };
type ReviewResult = { review?: ClientReview; error?: string; signInUrl?: string };
export function ClientReviewForm({ onReviews }: Props) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [mine, setMine] = useState<ClientReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [signInUrl, setSignInUrl] = useState("");
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("load");
      const data = await response.json() as ReviewList;
      onReviews(data.reviews);
      if (data.mine) {
        const review = data.mine as ClientReview;
        setMine(review); setName(review.name); setProject(review.project);
        setRating(review.rating); setComment(review.comment); setConsent(true);
      }
    }).catch(error => { if (error.name !== "AbortError") setLoadError(true); });
    return () => controller.abort();
  }, [onReviews]);
  async function refresh() {
    const response = await fetch("/api/reviews", { cache: "no-store" });
    if (!response.ok) throw new Error("Your change was saved, but the list couldn’t refresh. Reload to see it.");
    const data = await response.json() as ReviewList; onReviews(data.reviews); setLoadError(false);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setSignInUrl("");
    const parsed = reviewInput.safeParse({ name, project, rating, comment, consent });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json() as ReviewResult;
      if (!response.ok) {
        if (data.signInUrl) setSignInUrl(data.signInUrl);
        throw new Error(data.error || "Your review wasn’t saved. Please try again.");
      }
      if (!data.review) throw new Error("Your review wasn’t saved. Please try again.");
      setMine(data.review); await refresh();
      setMessage("Thank you for sharing your experience. Your feedback is now on the website.");
    } catch (error) { setError(error instanceof Error ? error.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/reviews", { method: "DELETE" }); const data = await response.json() as ReviewResult;
      if (!response.ok) throw new Error(data.error || "Your review couldn’t be removed.");
      setMine(null); setRating(0); setName(""); setProject(""); setComment(""); setConsent(false);
      await refresh(); setMessage("Your review has been removed.");
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="client-review-form-section" id="leave-review">
    <div className="review-form-intro"><span className="review-form-icon"><MessageSquare size={25}/></span><p className="new-eyebrow">A NOTE TO MY CLIENTS</p><h3>Dear client,<br/>thank you for trusting me.</h3><p>Every project is a team effort. If we’ve worked together, I’d love to hear how it felt — what you enjoyed, what could be better, and what you thought of the final work.</p><span className="review-form-note"><Check size={15}/> Your feedback helps me grow. You can update your review anytime.</span></div>
    <form className="client-review-form" onSubmit={submit} aria-label="Leave a client review">
      <fieldset className="rating-fieldset" disabled={busy}><legend>How was your experience? <span aria-hidden="true">*</span></legend><div className="rating-options" role="radiogroup" aria-label="Rating out of five">{[1,2,3,4,5].map(value=><label className={`rating-option ${rating>=value?"is-selected":""}`} key={value}><input type="radio" name="rating" value={value} checked={rating===value} onChange={()=>setRating(value)} aria-label={`${value} ${value===1?"star":"stars"}`} required/><Star size={27} fill={rating>=value?"currentColor":"none"} strokeWidth={1.6}/></label>)}<span aria-live="polite">{rating?`${rating} / 5`:"Select a rating"}</span></div></fieldset>
      <div className="review-form-fields"><label htmlFor="review-name">Your name <span aria-hidden="true">*</span><input id="review-name" value={name} onChange={event=>setName(event.target.value)} autoComplete="name" maxLength={80} minLength={2} placeholder="How should your name appear?" required disabled={busy}/></label><label htmlFor="review-project">Project or company <span aria-hidden="true">*</span><input id="review-project" value={project} onChange={event=>setProject(event.target.value)} maxLength={100} minLength={2} placeholder="What did we work on?" required disabled={busy}/></label></div>
      <label className="review-comment-label" htmlFor="review-comment">Your comment <span aria-hidden="true">*</span><textarea id="review-comment" value={comment} onChange={event=>setComment(event.target.value)} maxLength={1500} minLength={10} rows={4} placeholder="What was it like working together? I’d love to hear your thoughts…" required disabled={busy}/></label><span className="review-character-count">{comment.length} / 1500</span>
      <label className="review-consent"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)} required disabled={busy}/><span>Publish my name, rating, project and comment on this portfolio.</span></label>
      {loadError && <p className="review-form-error" role="status">Saved reviews couldn’t load. <button type="button" onClick={()=>refresh().catch(()=>setError("Reviews still couldn’t load. Please try again later."))}>Try again</button></p>}
      {error && <p className="review-form-error" role="alert">{error}</p>}
      {signInUrl && <a className="button button-white" href={signInUrl} target="_top">Sign in to publish <ArrowUpRight size={17}/></a>}
      {message && <p className="review-form-success" role="status"><Check size={17}/>{message}</p>}
      <div className="review-form-actions"><button type="submit" className="button button-orange" disabled={busy}><Send size={17}/>{busy?"Saving…":mine?"Update my feedback":"Share my feedback"}</button>{mine&&<button type="button" className="review-remove" onClick={remove} disabled={busy}><Trash2 size={16}/> Remove my review</button>}</div>
    </form>
  </div>;
}
