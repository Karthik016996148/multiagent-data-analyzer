import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DataFlow AI — Multi-Agent Data Analysis",
  description:
    "Upload your data and let a team of AI agents collaboratively analyze, visualize, and summarize insights in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative z-10 flex h-screen flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
