import { siteUrl } from "@/lib/seo";

export function GET() {
  const rules = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /signin-with-chatgpt",
    "Disallow: /signout-with-chatgpt",
    "Disallow: /callback",
    "",
    `Sitemap: ${siteUrl("/sitemap.xml")}`,
    "",
  ];
  return new Response(rules.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
