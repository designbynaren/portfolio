/** Local SVGs retain brand colours; the call icon uses a matching app-style tile. */
export function BrandIcon({ name, size = 24 }: { name: "gmail" | "whatsapp" | "linkedin" | "call"; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- Small local SVG assets do not need raster optimisation.
  return <img className="brand-icon" src={`/logos/${name}.svg`} alt="" width={size} height={size} draggable={false}/>;
}
