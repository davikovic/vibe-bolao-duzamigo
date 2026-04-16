import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
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
  title: "BOLÃO DUZAMIGO | World Cup 2026",
  description: "O dashboard de apostas definitivo da Copa",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-[#0a0a0a] text-white">
        {/* Sidebar Desktop */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative min-h-screen">
          <main className="flex-1 w-full max-w-7xl mx-auto md:px-8 pb-20 md:pb-10">
            {children}
          </main>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
        
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
