import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "armory-embeds/gw2a-embeds.406389af.css";


const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GW2 Assistant",
  description: "Advanced Assistant for Guild Wars 2",
};

import { Providers } from "@/shared/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
