import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  weight: "400",
  variable: "--font-poppin",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drawify",
  description:
    "Drawify - Real-time collaboration and powerful customization to intuitive tools and seamless workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
