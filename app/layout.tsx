import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Inter, Lora } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600"],
});

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
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
