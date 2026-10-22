import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { InterviewProvider } from "@/context/InterviewContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewPilot AI — Realistic Mock Interview Coach",
  description:
    "Practice tailored mock interview questions, identify your weaknesses, and elevate your performance through focused drills.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <InterviewProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </InterviewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
