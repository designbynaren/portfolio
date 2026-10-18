import type { CSSProperties } from "react";

export function SideProjects() {
  return <section className="side-projects-section" id="side-projects" aria-labelledby="side-projects-title"><div className="section-inner">
    <div className="side-projects-heading"><p className="new-eyebrow">BUILT OUT OF CURIOSITY</p><h2 id="side-projects-title">Some of my<br/><span>side projects.</span></h2><p>A few ideas I’m building, lessons I want to share,<br className="desktop-break"/> and creative detours worth exploring.</p></div>
    <div className="side-projects-explorer"><ul className="project-fan coming-soon-fan" aria-label="Five upcoming side projects">{Array.from({length:5},(_,index)=><li key={index} className="side-project-card coming-soon-card" style={{"--fan-angle":`${(index-2)*6}deg`,"--fan-lift":`${Math.abs(index-2)*12}px`,"--card-layer":index+1} as CSSProperties}><span>Coming Soon</span></li>)}</ul></div>
  </div></section>;
}
