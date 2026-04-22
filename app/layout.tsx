import type { Metadata } from "next";
import { Literata, Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const literata = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AISPEG - AI Strategic Plan Execution Group",
  description:
    "A growing inventory of AI interventions for operational excellence at the University of Idaho, coordinated by AISPEG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${literata.variable} ${manrope.variable}`}>
      <body className="bg-surface text-gray-900">
        <Sidebar />
        <main className="min-h-screen lg:ml-64">
          <div className="mx-auto max-w-6xl px-6 py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
