import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainNav } from "@/components/main-nav";
import { FamilyDataProvider } from "@/app/family/family-context";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FamilyOS - Family Organization Platform",
  description: "Comprehensive family organization platform for healthcare, tasks, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FamilyDataProvider>
          <MainNav />
          <main>{children}</main>
        </FamilyDataProvider>
      </body>
    </html>
  );
}
