"use client";
import { useEffect, useRef } from "react";

/** Progressive enhancement: content remains visible if JavaScript or observers fail. */
export function SiteMotion() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
      let active = "home";
      for (const section of sections) if (section.getBoundingClientRect().top <= 160) active = section.id;
      document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a, .nav-menu a").forEach(link => {
        if (link.hash === `#${active}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      document.documentElement.classList.toggle("page-scrolled", window.scrollY > 24);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, {passive:true});
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);window.removeEventListener("resize", schedule);
      document.documentElement.classList.remove("page-scrolled");
    };
  }, []);
  return <div ref={progress} className="reading-progress" aria-hidden="true"/>;
}
