import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recoil - Personal Memory App",
  description: "Store and search your memories with semantic search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
