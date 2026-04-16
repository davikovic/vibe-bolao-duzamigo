import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolão Duzamigo",
  description: "Bolão da copa entre amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center bg-gradient-to-br from-emerald-800 via-green-600 to-yellow-500 dark:from-green-950 dark:via-green-900 dark:to-yellow-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-950 min-h-screen flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.3)] border-x border-green-700 dark:border-green-950 overflow-x-hidden">
          <main className="flex-1">
            {children}
          </main>
          <BottomNav />
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
