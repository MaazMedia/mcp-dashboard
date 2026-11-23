import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdsIQ + BuildPredict — Live Dashboard",
  description: "Public share-link metrics for AdsIQ & BuildPredict clients.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#07070c] text-white">{children}</body>
    </html>
  );
}
