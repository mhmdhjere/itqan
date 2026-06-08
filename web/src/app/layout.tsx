import type { Metadata } from "next";
import { Amiri, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Itqan — Quran Circle Manager",
  description: "Manage Quran circles, track memorization, and run live recitation sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${amiri.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
