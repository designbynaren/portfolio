import { ArrowUpRight, Film, Layers3, Sparkles } from "lucide-react";

export const SIDE_CLIENTS = [
  { name: "MaxPe", work: "Product videos, brand identity & app design", story: "Helping a digital product explain what it does, through clear visuals and stories.", icon: Layers3 },
  { name: "Mahaveer Surface Studio", work: "AI product videos, social content & thumbnails", story: "Turning stone textures and product images into creative stories for the screen.", icon: Sparkles },
  { name: "Lamba Granites", work: "Granite videos, promotional visuals & social content", story: "Showing the character of each stone through video, design and everyday content.", icon: Film },
];
export function SideClients() {
  return <aside className="side-clients-card" aria-labelledby="side-clients-title"><p className="new-eyebrow">SIDE PROJECTS & BRAND WORK</p><h3 id="side-clients-title">My Side Clients<span>.</span></h3><p className="side-clients-intro">Different brands. Different stories.<br/>Here’s what I create for them.</p><div className="side-client-list">{SIDE_CLIENTS.map(client=><article key={client.name}><span className="side-client-icon"><client.icon size={22}/></span><div><h4>{client.name}</h4><p>{client.work}</p></div></article>)}</div><a href="#client-work" className="side-clients-link">Explore the client work <ArrowUpRight size={17}/></a></aside>;
}
