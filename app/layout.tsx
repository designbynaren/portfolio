import type { Metadata } from "next";
import "./globals.css";
import "./portfolio-polish.css";
import { SiteMotion } from "@/components/site-motion";
import { StructuredData } from "@/components/structured-data";
import { HOME_DESCRIPTION, HOME_TITLE, pageMetadata, siteStructuredData } from "@/lib/seo";
export const metadata: Metadata = {
  ...pageMetadata(HOME_TITLE, HOME_DESCRIPTION, "/"),
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}<StructuredData data={siteStructuredData} /><SiteMotion /></body></html>;
}
