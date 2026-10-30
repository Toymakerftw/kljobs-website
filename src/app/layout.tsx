import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kerala Tech Park Jobs — Technopark · Infopark · Cyberpark",
  description:
    "Search, filter and apply to jobs across Kerala's IT parks. Listings refresh automatically from official Technopark, Infopark, Cyberpark and UL Cyberpark career pages.",
  keywords: ["Kerala jobs", "Technopark", "Infopark", "Cyberpark", "IT jobs", "Kochi", "Trivandrum", "Kozhikode"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Kerala Tech Park Jobs",
    description: "Search, filter and apply to jobs across Kerala's IT parks.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
