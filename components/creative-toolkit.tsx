"use client";
import { useState } from "react";

const EDITING = [
  { name: "Premiere Pro", logo: "premiere", detail: "The story, rhythm & pacing" },
  { name: "After Effects", logo: "aftereffects", detail: "Movement that adds meaning" },
  { name: "DaVinci Resolve", logo: "davinci", detail: "The look of the final frame" },
  { name: "Audition", logo: "audition", detail: "Clean sound, clear conversations" },
];
const DESIGN = [
  { name: "Figma", logo: "figma" }, { name: "Photoshop", logo: "photoshop" },
  { name: "Illustrator", logo: "illustrator" }, { name: "Maya", logo: "maya" },
  { name: "Blender", logo: "blender" },
];
const AI = [
  { name: "ChatGPT", logo: "chatgpt", detail: "Finding the idea and the words", process: "I explore hooks, script ideas and different ways to tell the same story. Then I choose the direction that fits the audience." },
  { name: "Claude", logo: "claude", detail: "Giving the story a clear direction", process: "I work through the structure, refine the words and check that the message is easy to follow before it becomes a video." },
  { name: "Higgsfield", logo: "higgsfield", detail: "Exploring new worlds and visuals", process: "I explore scenes and visual ideas, then bring the results into my editing workflow to refine pacing, colour and realism." },
];
function ToolLogo({ name }: { name: string }) {
  return <span className={`tool-logo logo-${name}`}><img src={`/logos/${name}.svg`} alt="" width={40} height={40} loading="lazy" draggable={false}/></span>;
}
export function CreativeToolkit() {
  const [activeTool, setActiveTool] = useState(0);
  return <section className="toolkit toolkit-redesign" id="toolkit"><div className="section-inner">
    <div className="toolkit-heading"><div><p className="new-eyebrow">MY CREATIVE TOOLKIT</p><h2>A good story. The right tools.</h2></div></div>
    <div className="toolkit-panels">
      <article className="tool-panel editing-panel"><div className="tool-panel-heading"><span>01 / EDIT & FINISH</span><h3>The edit. The colour. The sound.</h3></div><div className="editing-tools">{EDITING.map(tool=><div className="tool-row" key={tool.name}><ToolLogo name={tool.logo}/><div><strong>{tool.name}</strong><span>{tool.detail}</span></div></div>)}</div></article>
      <article className="tool-panel design-panel"><div className="tool-panel-heading"><span>02 / DESIGN & MOTION</span><h3>Make it clear. Make it memorable.</h3></div><div className="design-tools">{DESIGN.map(tool=><div className="design-tool" key={tool.name}><ToolLogo name={tool.logo}/><strong>{tool.name}</strong></div>)}</div><p>From a brand’s first impression to the small details that make it feel familiar.</p></article>
      <article className="tool-panel ai-panel"><div className="ai-panel-intro"><span className="tool-panel-kicker">03 / CREATE WITH AI</span><h3>A little AI.<br/>A lot of intention.</h3><p>I use ChatGPT, Claude, Higgsfield and more AI tools to develop ideas and explore AI video. Then I shape the result in Premiere Pro, After Effects or DaVinci Resolve, with a human eye on realism and detail.</p></div><div className="ai-explorer"><div className="ai-tool-grid" role="group" aria-label="Explore my AI workflow">{AI.map((tool,index)=><button type="button" className={`ai-tool ${activeTool===index?"is-selected":""}`} key={tool.name} aria-pressed={activeTool===index} aria-controls="ai-workflow-detail" onClick={()=>setActiveTool(index)}><ToolLogo name={tool.logo}/><span className="ai-tool-name">{tool.name}</span><span className="ai-tool-description">{tool.detail}</span><span className="ai-tool-action">{activeTool===index?"Viewing workflow":"Explore workflow"} <span aria-hidden="true">↗</span></span></button>)}</div><div id="ai-workflow-detail" className="ai-workflow-detail" aria-live="polite" aria-atomic="true"><strong>{AI[activeTool].name} in my process</strong><p>{AI[activeTool].process}</p></div></div></article>
    </div>
  </div></section>;
}
