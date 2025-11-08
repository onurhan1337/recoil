import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Inter, Lora } from "next/font/google";
import { Providers } from "@/components/providers";
import { configure, withRSCTrace, RSCBoundary } from "quzz";
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

configure({
  logLevel: "info",
  outputFormat: "pretty",
  performance: {
    enabled: true,
    warnThreshold: 500,
    trackMemory: true,
  },
  logProps: true,
  contextTracking: false,
  enableSnapshots: false,
  verboseMode: false,
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        <RSCBoundary label="app-content">
          <Providers>
            {children}
            <Toaster richColors />
          </Providers>
        </RSCBoundary>
      </body>
    </html>
  );
}

export default withRSCTrace(RootLayout, {
  componentName: "RootLayout",
  performance: { enabled: true, warnThreshold: 100 },
  logProps: false,
});
