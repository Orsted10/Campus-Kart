import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const themeBoot = `(function(){try{var s=localStorage.getItem("ck-theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s||(m?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://campuskart.example"),
  title: "CampusKart — Your campus. Connected.",
  description:
    "Food, rides, essentials and campus services for university life — one ecosystem. CampusKart connects the moving parts of campus life.",
  keywords: [
    "CampusKart",
    "campus delivery",
    "student rides",
    "campus essentials",
    "college ecosystem",
  ],
  openGraph: {
    title: "CampusKart — Your campus. Connected.",
    description:
      "Food. Rides. Essentials. Campus life. One place. See the campus move before you use it.",
    type: "website",
    locale: "en_IN",
    siteName: "CampusKart",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CampusKart — campus life, connected" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusKart — Your campus. Connected.",
    description: "Food. Rides. Essentials. Campus life. One place.",
    images: ["/og.png"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
