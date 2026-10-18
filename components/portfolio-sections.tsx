"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Minus, Play, Plus, Quote, Star } from "lucide-react";

import { wrapReviewScroll } from "@/lib/review-scroll";

import { BrandIcon } from "@/components/brand-icon";
import { SideProjects } from "@/components/side-projects";
import { CONTACT } from "@/lib/contact";
import { ClientReviewForm } from "@/components/client-review-form";
import type { ClientReview } from "@/lib/review-validation";
export { CONTACT } from "@/lib/contact";
export const CATEGORIES = ["Long Form", "Short Form", "Motion", "AI Video", "Podcast", "Creative ad"] as const;
export type Category = typeof CATEGORIES[number];
export type Work = { title: string; subtitle: string; art: string; tag: string; number: string; youtube?: { id: string; thumbnail: string; channelUrl: string; channelName: string; portrait?: boolean } };
const EVOLUTION_FILM: Work = {
  title: "The Evolution of Innovation",
  subtitle: "An AI animated ad for a crypto brand.",
  art: "ai-scene", tag: "AI BRAND FILM", number: "01",
  youtube: { id: "PYgSRPJlFbg", thumbnail: "/images/youtube-PYgSRPJlFbg.jpg", channelUrl: "https://www.youtube.com/@NarendraSingh-0n", channelName: "Narendra Singh", portrait: false },
};
const WORK: Record<Category, Work[]> = {
  "Long Form": [
    {title:"MaxPe — Recharge App for Retailers",subtitle:"Long-form product video for MaxPeIndia.",art:"explainer",tag:"LONG FORM",number:"01",youtube:{id:"aZMUk4suTGo",thumbnail:"/images/youtube-aZMUk4suTGo.jpg",channelUrl:"https://www.youtube.com/@maxpeindia",channelName:"MaxPeIndia"}},
    {"title":"SunCrypto — USDT to INR","subtitle":"A clear walkthrough of converting USDT and transferring to a bank.","art":"podcast","tag":"LONG FORM","number":"02","youtube":{"id":"Bca76rpGh9g","thumbnail":"/images/youtube-Bca76rpGh9g.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {"title":"SunCrypto — Hamster Kombat","subtitle":"A long-form guide to Hamster Kombat.","art":"podcast","tag":"LONG FORM","number":"03","youtube":{"id":"saf7D2KBpxk","thumbnail":"/images/youtube-saf7D2KBpxk.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {title:"SunCrypto — Hamster Kombat Case Study",subtitle:"A closer look at Hamster Kombat and its listing announcement.",art:"explainer",tag:"LONG FORM",number:"04",youtube:{id:"2_EtdUVIAL4",thumbnail:"/images/youtube-2_EtdUVIAL4.jpg",channelUrl:"https://www.youtube.com/@suncryptoin",channelName:"Suncrypto"}},
  ],
  Podcast: [
    {"title":"Crypto Tax, Explained","subtitle":"A conversation with CA Pulkit Gupta on crypto taxation in India.","art":"podcast","tag":"PODCAST","number":"01","youtube":{"id":"HJK6b6G-yNU","thumbnail":"/images/youtube-HJK6b6G-yNU.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {"title":"The Future of Crypto in India","subtitle":"SunCast with Raajeev Anand, exploring what comes next.","art":"podcast","tag":"PODCAST","number":"02","youtube":{"id":"v8-H4R-EQyc","thumbnail":"/images/youtube-v8-H4R-EQyc.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {"title":"Ethereum — What Comes Next?","subtitle":"An in-depth conversation about the future of Ethereum.","art":"podcast","tag":"PODCAST","number":"03","youtube":{"id":"7J0pSM1etqA","thumbnail":"/images/youtube-7J0pSM1etqA.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {"title":"Inside the Crypto Market","subtitle":"A conversation with Rajeev Anand on market trends and manipulation.","art":"podcast","tag":"PODCAST","number":"04","youtube":{"id":"-tzgZFhlsWE","thumbnail":"/images/youtube--tzgZFhlsWE.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
  ],
  "Short Form": [
    {title:"MaxPe — Every Recharge Counts",subtitle:"A short, direct story about recharge savings.",art:"reel",tag:"SHORT FORM",number:"01",youtube:{id:"U0OJ4lsU6tU",thumbnail:"/images/youtube-U0OJ4lsU6tU.jpg",channelUrl:"https://www.youtube.com/@maxpeindia",channelName:"MaxPeIndia",portrait:true}},
    {title:"Podcast highlights",subtitle:"A good conversation, cut down to its most watchable moments.",art:"podcast",tag:"PODCAST",number:"02"},
    {title:"Promotional edits",subtitle:"A simple message, brought to life with rhythm and visuals.",art:"campaign",tag:"PROMO",number:"03"},
    {title:"Social-first storytelling",subtitle:"Stories made for the way people watch on their phones.",art:"short",tag:"SHORT FORM",number:"04"},
  ],
  Motion: [
    {title:"MaxPe — Recharge with UPI",subtitle:"A step-by-step recharge journey, brought to life with motion.",art:"reel",tag:"MOTION",number:"01",youtube:{id:"PVln6ORuXoI",thumbnail:"/images/youtube-PVln6ORuXoI.jpg",channelUrl:"https://www.youtube.com/@maxpeindia",channelName:"MaxPeIndia",portrait:false}},
    {title:"MaxPe — Getting Started",subtitle:"Making registration simple through a clear visual walkthrough.",art:"reel",tag:"MOTION",number:"02",youtube:{id:"e1J-KHOWCh0",thumbnail:"/images/youtube-e1J-KHOWCh0.jpg",channelUrl:"https://www.youtube.com/@maxpeindia",channelName:"MaxPeIndia",portrait:false}},
    {title:"Product walkthroughs",subtitle:"Guide people through the product, one clear step at a time.",art:"explainer",tag:"PRODUCT",number:"03"},
    {title:"Visual transitions",subtitle:"Join the moments so the story feels like one piece.",art:"motion",tag:"TRANSITIONS",number:"04"},
  ],
  "Creative ad": [
    {title:"MaxPe — Rakhi Ad",subtitle:"A festive story made for the small screen.",art:"reel",tag:"CREATIVE AD",number:"01",youtube:{id:"AtUHrmRjOW8",thumbnail:"/images/youtube-AtUHrmRjOW8.jpg",channelUrl:"https://www.youtube.com/@maxpeindia",channelName:"MaxPeIndia",portrait:true}},
    {"title":"SunCrypto — Celebrate Your Bonds","subtitle":"A Raksha Bandhan campaign about the bonds we share.","art":"podcast","tag":"CREATIVE AD","number":"02","youtube":{"id":"VfoB8elPQlc","thumbnail":"/images/youtube-VfoB8elPQlc.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {"title":"SunCrypto — A Diwali Story","subtitle":"A festive campaign bringing SunCrypto SIP into the story.","art":"podcast","tag":"CREATIVE AD","number":"03","youtube":{"id":"RbkfDSurCQI","thumbnail":"/images/youtube-RbkfDSurCQI.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
    {"title":"SunCrypto — Rakhi Special","subtitle":"A festive brand story for Raksha Bandhan.","art":"podcast","tag":"CREATIVE AD","number":"04","youtube":{"id":"XTTLo4b8pmo","thumbnail":"/images/youtube-XTTLo4b8pmo.jpg","channelUrl":"https://www.youtube.com/@suncryptoin","channelName":"Suncrypto","portrait":false}},
  ],
  "AI Video": [
    EVOLUTION_FILM,
    {title:"Generative visual stories",subtitle:"Start with a thought. Explore where AI can take it.",art:"ai-scene",tag:"AI VISUALS",number:"02"},
    {title:"AI-assisted edits",subtitle:"New possibilities, shaped by an editor’s eye.",art:"ai-edit",tag:"AI EDITING",number:"03"},
    {title:"Creative experiments",subtitle:"Try an unexpected idea. See what it can become.",art:"ai-motion",tag:"AI EXPLORATION",number:"04"},
  ],
};
function WorkArtwork({work}:{work:Work}) {
  if (work.youtube) return <div className="work-art real-work-art" aria-hidden="true"><img src={work.youtube.thumbnail} alt="" width={1280} height={720} decoding="async" loading="lazy"/><span className="real-work-badge">{work.tag} / {work.number}</span><span className="work-play"><Play size={22} fill="currentColor" strokeWidth={0}/></span></div>;
  return <div className={`work-art art-${work.art}`} aria-hidden="true"><div className="art-grid"/><span className="art-tag">{work.tag} / {work.number}</span>
    {work.art === "explainer" ? <><div className="art-flow"><span>IDEA</span><i/><span>STORY</span><i/><span>IMPACT</span></div><div className="art-orbit"/></> :
    work.art === "brand" ? <><span className="art-brand-word">make<br/><em>it move.</em></span><div className="brand-orbs"><i/><i/><i/></div></> :
    work.art === "campaign" ? <><span className="art-campaign-word">LESS<br/><em>SCROLL.</em><br/>MORE STORY.</span><div className="art-sticker">PLAY<br/>IT AGAIN ↗</div></> :
    work.art === "motion" ? <><div className="art-motion-word">MOTION<span>IS A LANGUAGE.</span></div><div className="motion-rings"><i/><i/><i/></div></> :
    work.art === "podcast" ? <><div className="waveform">{Array.from({length:23},(_,i)=><i key={i} style={{height:`${22 + (i*37)%92}px`}}/>)}</div><span className="art-bottom-word">A conversation.<br/><em>A great cut.</em></span></> :
    work.art === "reel" || work.art === "short" ? <><div className="art-phone"><span>STORIES<br/><em>IN MOTION.</em></span><i/><b>00:15</b></div><span className="art-short-word">small format.<br/>big impression.</span></> :
    work.art === "type" ? <><span className="art-type-word">WORDS<br/><em>WITH</em><br/>ENERGY.</span><span className="type-star">✳</span></> :
    <><div className="ai-orb"/><div className="ai-art-word">{work.art === "ai-product" ? "NEW PERSPECTIVES." : work.art === "ai-scene" ? "IMAGINE. CREATE." : work.art === "ai-edit" ? "HUMAN EYE. AI TOOLS." : "WHAT COMES NEXT?"}</div><span className="ai-art-footer">CREATIVE EXPLORATION / AI VIDEO</span></>}
    <span className="art-preview-label">SHOWCASE PLACEHOLDER</span><span className="work-play"><Play size={22} fill="currentColor" strokeWidth={0}/></span></div>;
}
export function SelectedWork({onSelect}:{onSelect:(work:Work)=>void}) {
  const [active,setActive]=useState<Category>("Long Form");
  return <section className="selected-work dark-section" id="work"><div className="section-inner"><div className="work-heading"><div><p className="new-eyebrow">PORTFOLIO</p><h2 className="section-title">Selected Work<span className="orange">.</span></h2></div><div className="work-tabs" role="tablist" aria-label="Work categories">{CATEGORIES.map(category=><button key={category} id={`tab-${category.replaceAll(" ","-")}`} type="button" role="tab" tabIndex={active===category?0:-1} aria-selected={active===category} aria-controls="work-panel" className={active===category?"is-active":""} onClick={()=>setActive(category)} onKeyDown={event=>{
            const index=CATEGORIES.indexOf(category);
            const next=event.key==="ArrowRight"?(index+1)%CATEGORIES.length:event.key==="ArrowLeft"?(index+CATEGORIES.length-1)%CATEGORIES.length:event.key==="Home"?0:event.key==="End"?CATEGORIES.length-1:-1;
            if(next<0)return;event.preventDefault();const nextCategory=CATEGORIES[next];setActive(nextCategory);const nextTab=document.getElementById(`tab-${nextCategory.replaceAll(" ","-")}`);nextTab?.focus({preventScroll:true});nextTab?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});
          }}>{category}</button>)}</div></div><div className={`work-grid ${active === "Short Form" ? "short-form-grid" : ""}`} role="tabpanel" id="work-panel" aria-labelledby={`tab-${active.replaceAll(" ","-")}`} key={active}>{WORK[active].map(work=><button className={`work-card ${work.youtube ? "has-video" : "is-placeholder"}`} key={work.title} onClick={()=>onSelect(work)} aria-label={`${work.title}: ${work.youtube ? "play video on this page" : "open video placeholder"}`}><WorkArtwork work={work}/><div className="work-card-caption"><div><h3>{work.title}</h3><p>{work.subtitle}</p></div><ArrowUpRight size={21}/></div></button>)}</div></div></section>;
}
const CLIENT_FEATURED: Work[] = [
  EVOLUTION_FILM,
  { title: "Mahaveer · Stone in motion", subtitle: "Turning real stone textures into a new kind of visual story.", art: "ai-product", tag: "MAHAVEER / AI VIDEO", number: "02" },
];
export function ClientLovedWork({ onSelect }: { onSelect: (work: Work) => void }) {
  return <section className="client-loved-work dark-section" id="client-work"><div className="section-inner"><div className="client-work-heading"><div><p className="new-eyebrow">MADE WITH BRANDS</p><h2 className="section-title">Work Loved by Clients<span>.</span></h2></div><p>A closer look at the stories I create with brands.</p></div><div className="work-grid client-work-grid">{CLIENT_FEATURED.map(work=><button key={work.title} className="work-card" onClick={()=>onSelect(work)} aria-label={`${work.title}: ${work.youtube ? "play video on this page" : "open video placeholder"}`}><WorkArtwork work={work}/><div className="work-card-caption"><div><h3>{work.title}</h3><p>{work.subtitle}</p></div><ArrowUpRight size={21}/></div></button>)}</div></div></section>;
}
type DisplayReview = { placeholder: boolean; name: string; rating: number; text: string; role: string; initial: string };
const REVIEW_PREVIEWS: DisplayReview[] = [
  {placeholder:true,name:"Client testimonial",rating:0,text:"A client’s thoughts on the storytelling, pacing and final edit will appear here.",role:"Video editing project",initial:"VE"},
  {placeholder:true,name:"Client testimonial",rating:0,text:"Feedback on creative direction, communication and bringing a brand’s ideas to life will appear here.",role:"Brand & creative project",initial:"BC"},
  {placeholder:true,name:"Client testimonial",rating:0,text:"A review of the process, attention to detail and finished motion graphics will appear here.",role:"Motion design project",initial:"MD"},
  {placeholder:true,name:"Client testimonial",rating:0,text:"A client’s feedback on the product film, from the shoot to the final delivery, will appear here.",role:"Product video project",initial:"PV"},
  {placeholder:true,name:"Client testimonial",rating:0,text:"Feedback about collaboration, visual design and consistency across the campaign will appear here.",role:"Campaign project",initial:"CP"},
  {placeholder:true,name:"Client testimonial",rating:0,text:"A review of the short-form edits, creative approach and finished content will appear here.",role:"Short-form project",initial:"SF"},
];
export function Reviews() {
  const [reviews,setReviews]=useState<ClientReview[]>([]);
  const submitted: DisplayReview[] = reviews.map(review=>({placeholder:false,name:review.name,rating:review.rating,text:review.comment,role:review.project,initial:review.name.split(/\s+/).slice(0,2).map(word=>word[0]).join("").toUpperCase()}));
  // Keep both scrolling columns filled until enough real feedback has arrived.
  const cards = [...submitted, ...REVIEW_PREVIEWS.slice(0, Math.max(0, 6-submitted.length))];
  const left=cards.filter((_,i)=>i%2===0),right=cards.filter((_,i)=>i%2===1);
  return <section className="reviews dark-section" id="reviews"><div className="section-inner"><div className="reviews-heading"><div><p className="new-eyebrow">CLIENT WORDS</p><h2 className="section-title">The people behind<br/>the projects.</h2></div>{reviews.length>0&&<div className="review-rating-summary"><Star size={21} fill="currentColor"/><strong>{(reviews.reduce((sum,review)=>sum+review.rating,0)/reviews.length).toFixed(1)} / 5</strong><span>From {reviews.length} client {reviews.length===1?"review":"reviews"}</span></div>}</div><div className="review-window"><ReviewColumn items={left} direction={1} label="Left review column" loop/><ReviewColumn items={right} direction={-1} label="Right review column" loop/></div><ClientReviewForm onReviews={setReviews}/></div></section>;
}
function ReviewColumn({items,direction,label,loop}:{items:DisplayReview[];direction:1|-1;label:string;loop:boolean}) {
  const column=useRef<HTMLDivElement>(null);
  const track=useRef<HTMLDivElement>(null);
  const drag=useRef<{pointer:number;y:number}|null>(null);
  const hovered=useRef(false);
  const focused=useRef(false);
  useEffect(()=>{
    const element=column.current;
    const group=track.current?.firstElementChild as HTMLElement|null;
    if(!element||!group)return;
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0,last=0,visible=true,position=0,applied=0;
    function setMotion(){ if(!element||!group)return; element.dataset.reduced=String(motion.matches);position=motion.matches||!loop?0:group.offsetHeight;element.scrollTop=position;applied=element.scrollTop; }
    setMotion();motion.addEventListener("change",setMotion);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(element);
    function animate(time:number){
      if(!element||!group)return;
      const elapsed=last?Math.min(time-last,50):0;last=time;
      if(!motion.matches && loop){
        const moving=visible&&!document.hidden&&!hovered.current&&!focused.current&&!drag.current;
        // Preserve fractional motion even when a browser rounds native scrollTop.
        if(element.scrollTop!==applied)position=element.scrollTop;
        position=wrapReviewScroll(position+(moving?direction*elapsed*.022:0),group.offsetHeight);
        element.scrollTop=position;applied=element.scrollTop;
      }
      frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();motion.removeEventListener("change",setMotion);};
  },[direction,loop,items.length]);
  function endDrag(){drag.current=null;column.current?.classList.remove("is-dragging");}
  return <div ref={column} className="review-column draggable-reviews" role="region" aria-label={label+". Drag, scroll or use arrow keys to explore."} tabIndex={0}
    onPointerEnter={()=>{hovered.current=true;}} onPointerLeave={()=>{hovered.current=false;}}
    onFocus={()=>{focused.current=true;}} onBlur={()=>{focused.current=false;}}
    onPointerDown={event=>{
      if(event.pointerType==="touch"||event.button!==0)return;
      event.preventDefault();event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);
      drag.current={pointer:event.pointerId,y:event.clientY};event.currentTarget.classList.add("is-dragging");
    }}
    onPointerMove={event=>{
      const current=drag.current;if(!current||current.pointer!==event.pointerId)return;
      event.currentTarget.scrollTop-=event.clientY-current.y;current.y=event.clientY;
    }}
    onPointerUp={event=>{endDrag();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
    onPointerCancel={endDrag} onLostPointerCapture={endDrag}
    onKeyDown={event=>{
      const delta=event.key==="ArrowDown"?100:event.key==="ArrowUp"?-100:event.key==="PageDown"?event.currentTarget.clientHeight*.8:event.key==="PageUp"?-event.currentTarget.clientHeight*.8:0;
      if(delta){event.preventDefault();event.currentTarget.scrollTop+=delta;}
    }}>
    <div className="review-track" ref={track}>{(loop?[0,1,2]:[0]).map(copy=><div className="review-group" key={copy} aria-hidden={copy>0?true:undefined}>{items.map((review,i)=><article className="review-card" key={i}><div className="review-card-top"><Quote size={23} fill="currentColor" strokeWidth={0}/>{review.placeholder?<span>PLACEHOLDER REVIEW</span>:<span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{[1,2,3,4,5].map(star=><Star key={star} size={15} fill={star<=review.rating?"currentColor":"none"} strokeWidth={1.5}/>)}</span>}</div><p>{review.text}</p><div className="review-author"><span className="review-avatar">{review.initial}</span><div><strong>{review.name}</strong><span>{review.role}</span></div></div></article>)}</div>)}</div>
  </div>;
}
const FAQS=[
  {question:"What can you help me create?",answer:"From a product film to a podcast episode, a YouTube story to a short reel — I work across video editing, shooting, motion graphics and visual design. I also create AI-assisted visuals and app motion in JSON/Lottie."},
  {question:"Do I need a finished brief?",answer:"A rough idea is a good start. Share what you want to say, who it’s for and a few references you like. We can shape the direction together before the editing begins."},
  {question:"Can you edit for YouTube and social media?",answer:"Yes. I work on long-form videos, reels, short-form content and podcast highlights. Each format needs its own rhythm, so I shape the story, pacing and visuals around where people will watch it."},
  {question:"How long will my project take?",answer:"That depends on the footage, video length, animation and feedback involved. Once I understand your project, we’ll agree on a realistic timeline before we start."},
  {question:"What happens after I get in touch?",answer:"We talk through your idea, look at your footage and references, then agree on the scope and timeline. I create a first version, we review it together, and I refine the work for the final delivery."},
  {question:"How do you use AI in your work?",answer:"I use AI to explore ideas, develop visual directions and experiment with video. ChatGPT, Claude and Higgsfield work alongside tools like Premiere Pro, After Effects and DaVinci Resolve. The story, realism and final creative decisions still need a human eye."},
];
export function FAQs() {
 const [open,setOpen]=useState<number|null>(null);
 return <section className="faqs dark-section" id="faq"><div className="section-inner faq-layout"><div className="faq-intro"><p className="new-eyebrow">FAQS</p><h2 className="section-title">Before we<br/>make something.</h2><p>A few things you might want to know. If your question isn’t here, I’m a message away.</p><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">Let’s chat on WhatsApp <ArrowUpRight size={17}/></a></div><div className="faq-list">{FAQS.map((faq,i)=><article className={`faq-item ${open===i?"is-open":""}`} key={faq.question}><h3><button aria-expanded={open===i} aria-controls={`faq-answer-${i}`} id={`faq-question-${i}`} onClick={()=>setOpen(open===i?null:i)}><span>{i+1}. {faq.question}</span><span className="faq-toggle">{open===i?<Minus size={17}/>:<Plus size={17}/>}</span></button></h3><div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} className="faq-answer" hidden={open!==i}><p>{faq.answer}</p></div></article>)}</div></div></section>;
}
export function ContactCards({compact=false}:{compact?:boolean}) {
 return <div className={compact?"contact-card-list is-compact":"contact-card-list"}><a href={CONTACT.gmail} target="_blank" rel="noopener noreferrer"><span className="contact-icon"><BrandIcon name="gmail" size={26}/></span><span><small>EMAIL</small><strong>{CONTACT.email}</strong></span><ArrowUpRight size={18}/></a><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"><span className="contact-icon icon-whatsapp"><BrandIcon name="whatsapp" size={28}/></span><span><small>WHATSAPP</small><strong>{CONTACT.phone}</strong></span><ArrowUpRight size={18}/></a>{!compact&&<a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer"><span className="contact-icon icon-linkedin"><BrandIcon name="linkedin" size={25}/></span><span><small>LINKEDIN</small><strong>/in/design-by-narendra</strong></span><ArrowUpRight size={18}/></a>}<a href="tel:+917229993461"><span className="contact-icon icon-call"><BrandIcon name="call" size={27}/></span><span><small>CALL ME</small><strong>{CONTACT.phone}</strong></span><ArrowUpRight size={18}/></a></div>;
}
export function ContactSection() {
 return <><SideProjects/><section className="contact-new dark-section contact-redesign contact-simple" id="contact"><div className="section-inner"><div className="contact-details"><div className="contact-details-heading"><div><p className="new-eyebrow">LET’S CONNECT</p><h2 className="section-title">Have a story in mind?</h2></div><p>A message, an email or a quick call.<br/>Pick what works for you.</p></div><ContactCards/></div></div></section></>;
}
