import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Athlete Base",
  description: "A comprehensive platform for college athletes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
