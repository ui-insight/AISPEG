import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
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
    <html lang="en" className={publicSans.variable}>
      <body className="bg-surface text-brand-black antialiased">
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
