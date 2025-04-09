import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TagTrackerProviderWrapper } from '@/components/TagTrackerProviderWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "React Tag Tracker",
  description: "Track custom events and automatically send them to window.dataLayer, optimizing integration with tools like GTM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TagTrackerProviderWrapper>
          {children}
        </TagTrackerProviderWrapper>
      </body>
    </html>
  );
}
