import type { Metadata } from "next";
import { CONTACT } from "./contact";

// Switch this origin only after the custom domain is active in Sites. All
// canonical, social-preview, structured-data and sitemap URLs share this value.
export const SITE_ORIGIN = "https://narendra-portfolio-editor.designbynarendra.chatgpt.site";
export const SITE_NAME = "Narendra Singh";
export const PERSON_ID = `${SITE_ORIGIN}/#person`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const HOME_TITLE = "Narendra Singh | Video Editor & Design Manager in Jaipur";
export const HOME_DESCRIPTION = "Explore Narendra Singh’s portfolio of video editing, motion graphics, AI films and design. Based in Jaipur, India, with 5+ years of experience.";

export function siteUrl(path = "/") {
  return new URL(path, SITE_ORIGIN).toString();
}

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const image = {
    url: siteUrl("/media/intro-preview-poster.jpg"),
    width: 1280,
    height: 720,
    alt: "Frame by frame — Narendra Singh, video and design",
  };

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description,
    applicationName: "Frame By Narendra",
    authors: [{ name: SITE_NAME, url: siteUrl() }],
    creator: SITE_NAME,
    alternates: { canonical: siteUrl(path) },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      title,
      description,
      url: siteUrl(path),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
  };
}

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: siteUrl(),
      name: SITE_NAME,
      alternateName: "Frame By Narendra",
      inLanguage: "en-IN",
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SITE_NAME,
      url: siteUrl(),
      image: siteUrl("/images/narendra-table-portrait.webp"),
      jobTitle: "Sr. Video Editor & Design Manager",
      description: HOME_DESCRIPTION,
      email: CONTACT.email,
      sameAs: [CONTACT.linkedin],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressCountry: "IN",
      },
      knowsAbout: ["Video editing", "Motion graphics", "AI video", "Graphic design", "Product design"],
    },
  ],
};

export const experienceStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": siteUrl("/experience#webpage"),
      url: siteUrl("/experience"),
      name: "Narendra Singh’s work experience",
      inLanguage: "en-IN",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      breadcrumb: { "@id": siteUrl("/experience#breadcrumbs") },
    },
    {
      "@type": "BreadcrumbList",
      "@id": siteUrl("/experience#breadcrumbs"),
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Portfolio", item: siteUrl() },
        { "@type": "ListItem", position: 2, name: "Experience", item: siteUrl("/experience") },
      ],
    },
  ],
};
