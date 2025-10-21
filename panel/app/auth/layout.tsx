import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/sections/Navigation";
import Footer from "@/sections/Footer";
import ToastProvider from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "This is an admin panel for beancart shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 lg:ml-0 min-h-screen flex flex-col">
            <div className="flex-1 p-4 lg:p-8">
              {children}
            </div>
            <Footer />
          </main>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}