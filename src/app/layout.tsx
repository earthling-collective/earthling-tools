import "@/styles/main.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LocalFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Nav } from "@/components/nav";
import { JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const display = LocalFont({ src: "./font.otf", variable: "--font-display-face" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.collective.name, url: site.collective.url }],
  creator: site.collective.name,
  keywords: ["developer tools", "online tools", "free tools", "browser tools", "open source", "earthling"],
  openGraph: { siteName: site.name, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/", types: { "text/plain": "/llms.txt" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
  ],
};

// Applies the saved theme before first paint, keeping every page static
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const orgJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    publisher: { "@type": "Organization", name: site.collective.name, url: site.collective.url },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.collective.name,
    alternateName: "Earthling",
    url: site.collective.url,
    email: site.contact,
    sameAs: [site.ui.url, site.repo],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="system"
      className={`${display.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="bg-background fixed top-3 left-3 z-50 -translate-y-24 rounded-lg border px-4 py-2 text-sm focus:translate-y-0"
        >
          Skip to content
        </a>
        <JsonLd data={orgJsonLd} />
        <Header />
        <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto border-r lg:block">
            <Nav />
          </aside>
          {children}
        </div>
        <Footer />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
