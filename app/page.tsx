"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, Menu, Play, Plus, X } from "lucide-react";
import { ContactCards, ContactSection, FAQs, Reviews, SelectedWork, ClientLovedWork, type Work } from "@/components/portfolio-sections";
import { CreativeToolkit } from "@/components/creative-toolkit";
import { BrandIcon } from "@/components/brand-icon";
import { IntroPlayer } from "@/components/intro-player";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<"video" | "contact" | "work" | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const nav = useRef<HTMLElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    function dismiss(event: PointerEvent) { if (nav.current && !nav.current.contains(event.target as Node)) setMenuOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setMenuOpen(false); document.getElementById("navigation-toggle")?.focus(); } }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);
  useEffect(() => {
    if (modal) { dialog.current?.showModal(); document.body.style.overflow = "hidden"; }
    else { dialog.current?.close(); document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [modal]);
  useEffect(() => () => { if (video) URL.revokeObjectURL(video); }, [video]);
  function openModal(type: "video" | "contact" | "work") { if (type === "work") document.querySelector<HTMLVideoElement>(".intro-video")?.pause(); setFileError(""); setMenuOpen(false); setModal(type); }
  function selectFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFileError("Please choose a video file."); return;
    }
    setFileError(""); const url = URL.createObjectURL(file);
    setVideo(url); setModal(null);
  }
  return (
    <main className="site-shell" id="main-content" tabIndex={-1}>
      <section className="hero light-hero" id="home" aria-label="Introduction">
          <header className="header" ref={nav}>
            <a className="wordmark" href="#home" aria-label="Narendra home">narendra<span className="brand-dot" aria-hidden="true" /></a>
            <div className="header-right"><nav className="desktop-nav" aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#reviews">Reviews</a><a href="#faq">FAQs</a></nav><button className="header-contact" onClick={() => openModal("contact")}>Let’s talk <ArrowUpRight size={16}/></button><button id="navigation-toggle" className="menu-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
            {menuOpen && <nav className="nav-menu" id="site-navigation"><a href="#home" onClick={() => setMenuOpen(false)}>Introduction <ArrowUpRight size={16} /></a><a href="#work" onClick={() => setMenuOpen(false)}>Selected work <ArrowUpRight size={16} /></a><a href="#about" onClick={() => setMenuOpen(false)}>About me <ArrowUpRight size={16} /></a><a href="/experience" onClick={() => setMenuOpen(false)}>My Experience <ArrowUpRight size={16} /></a><a href="#side-projects" onClick={() => setMenuOpen(false)}>Side projects <ArrowUpRight size={16} /></a><a href="#reviews" onClick={() => setMenuOpen(false)}>Client reviews <ArrowUpRight size={16} /></a><a href="#faq" onClick={() => setMenuOpen(false)}>FAQs <ArrowUpRight size={16} /></a><a href="#contact" onClick={() => setMenuOpen(false)}>Let’s talk <ArrowUpRight size={16} /></a></nav>}
          </header>
        <div className="hero-copy">
          <div className="hero-badge"><span>5+ years</span><ul className="hero-services" aria-label="Creative services">{["Video Editing","AI Video","Motion","Podcast","Design"].map(service=><li key={service}>{service}</li>)}</ul></div>
          <h1 className="hero-introduction"><span className="hero-name">Hi, I’m Narendra.</span><span className="hero-role">Sr. Video Editor &amp; Design Manager.</span></h1>
          <p className="hero-description">I turn ideas into stories people feel.</p>
          <div className="hero-actions"><a className="button button-orange" href="/resume/Narendra-Singh-Resume.pdf" download="Narendra-Singh-Video-Editor-Design-Manager-Resume.pdf"><Download size={17}/> Resume</a><button onClick={()=>openModal("contact")} className="button button-white">Contact Me <ArrowUpRight size={17}/></button></div>
        </div>
        <div className="hero-stage">
          <IntroPlayer source={video} onReplace={() => openModal("video")} />
        </div>
      </section>
      <section className="about reference-about portrait-about" id="about">
        <div className="about-bio"><p className="eyebrow">About Me</p><h2>Story first.<br/><span>Always.</span></h2><p>I’m Narendra. I bring raw footage, ideas and conversations together into stories that feel clear, natural and worth watching.</p><p>At <strong>SunCrypto</strong>, I connect video, design and product. Beyond work, I explore AI video and build small creative projects.</p><a className="bio-button" href="/experience">My Experience <ArrowUpRight size={17}/></a></div>
        <div className="about-portrait"><img className="portrait-photo-final" src="/images/narendra-table-portrait.webp" decoding="async" alt="Narendra Singh in a white shirt, leaning forward with folded hands resting on a table" width={1122} height={1402} loading="lazy"/><div className="portrait-note" aria-hidden="true"><span>Hi, this<br/>is me!</span><svg viewBox="0 0 130 140" fill="none"><path d="M88 20c24 27 35 57 9 70-15 8-36 10-69 13m0 0 16-16m-16 16 22 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="m98 4 3-12m13 16 12-6m-5 21 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div><svg className="portrait-zigzag" viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true"><path d="M0 24V16L15 0l15 16L45 0l15 16L75 0l15 16L105 0l15 16L135 0l15 16L165 0l15 16L195 0l15 16L225 0l15 16L255 0l15 16L285 0l15 16L315 0l15 16L345 0l15 16L375 0l15 16L405 0l15 16L435 0l15 16L465 0l15 16L495 0l15 16L525 0l15 16L555 0l15 16L585 0l15 16v8Z" fill="#f6f6f6"/></svg><div className="portrait-facts portrait-facts-three"><article><strong>5+ <span>years</span></strong><p>Across video, design &amp; motion</p></article><article><strong>2 <span>companies</span></strong><p>Full-time at <b>SunCrypto</b> &amp; <b>Metasoftech</b></p></article><article><strong>50+ <span>side projects</span></strong><p>Independent video &amp; design work</p></article></div></div>
      </section>
      <SelectedWork onSelect={work => { setSelectedWork(work); openModal("work"); }} />
      <ClientLovedWork onSelect={work => { setSelectedWork(work); openModal("work"); }} />
      <CreativeToolkit />
      <Reviews />
      <FAQs />
      <ContactSection />
      <footer><a href="#home" className="wordmark footer-mark">narendra<span className="brand-dot" aria-hidden="true" /></a><p>VIDEO EDITOR & DESIGN MANAGER</p><a href="#home">BACK TO TOP <ArrowUpRight size={14} /></a></footer>
      <dialog ref={dialog} aria-label={modal === "contact" ? "Contact Narendra" : modal === "work" ? selectedWork?.title || "Project preview" : "Video preview"} className={`portfolio-dialog ${modal === "contact" ? "contact-dialog" : modal === "work" && selectedWork?.youtube ? `project-video-dialog ${selectedWork.youtube.portrait ? "portrait-video-dialog" : ""}` : ""}`} onCancel={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) setModal(null); }} onClose={() => setModal(null)}>
        <button autoFocus className="dialog-close" aria-label="Close dialog" onClick={() => setModal(null)}><X size={21} /></button>
        {modal === "video" ? <><p className="eyebrow orange">THE INTRO FILM</p><h2>Meet me.<br />In motion.</h2><p>The intro reel is a sample for now. Choose a video to see how your own introduction will look here.</p><button className="button button-orange" onClick={() => videoInput.current?.click()}><Plus size={18} /> Preview a video</button><p className="preview-note">Choose a video to preview on this device. It won’t be published or saved.</p></> : modal === "work" ? selectedWork?.youtube ? <><div className="project-video-frame"><iframe key={selectedWork.youtube.id} src={`https://www.youtube-nocookie.com/embed/${selectedWork.youtube.id}?autoplay=1&rel=0&playsinline=1`} title={selectedWork.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><div className="project-video-actions"><a className="project-watch-link" href={`https://www.youtube.com/watch?v=${selectedWork.youtube.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={16}/></a></div></> : <><p className="eyebrow orange">SHOWCASE PLACEHOLDER</p><h2>{selectedWork?.title}</h2><p>{selectedWork?.subtitle}</p><div className="work-video-pending"><Play size={32}/><span>The video is on its way</span></div><p className="preview-note">This is a preview card. The project video will be added here soon.</p><button className="button button-orange" onClick={() => setModal(null)}>Back to the work <ArrowUpRight size={17}/></button></> : <><div className="contact-dialog-intro"><span className="contact-dialog-icon"><BrandIcon name="whatsapp" size={30}/></span><p className="new-eyebrow">LET’S CONNECT</p><h2>Your next story<br/>starts with a hello.</h2><p>A rough idea is a good place to start. Tell me what you have in mind.</p></div><ContactCards compact/></>}

        {fileError && <p role="alert" className="file-error">{fileError}</p>}
      </dialog>
      <input ref={videoInput} type="file" accept="video/*" hidden onChange={e => selectFile(e.target.files?.[0])} />
      {fileError && !modal && <p role="alert" className="video-error">{fileError}</p>}
    </main>
  );
}
