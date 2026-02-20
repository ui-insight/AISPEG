import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AISPEG - AI Strategic Planning & Evaluation Group",
  description:
    "Collaborative hub for planning, lessons learned, and knowledge sharing around agentic AI at the University of Idaho.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
