import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripRescue — Intelligent Travel Disruption Recovery",
  description:
    "When your trip breaks, we rebuild it. Real-time multi-modal travel disruption detection, graph impact cascade, and instant recovery planning.",
  icons: {
    icon: [
      { url: "/brand-logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/brand-logo.png",
    shortcut: "/brand-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="icon" href="/brand-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/brand-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#080c14] text-[#f8fafc] antialiased"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}

