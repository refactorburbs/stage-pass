import type { Metadata } from "next";
import { Lunasima } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import BlueprintGrid from "@/components/Layout/BlueprintGrid/BlueprintGrid";

import "./globals.css";

const lunasima = Lunasima({
  weight: ["400", "700"],
  variable: "--font-lunasima",
  subsets: ["latin"],
});

const mada = localFont({
  src: "font/Mada-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-mada"
});

export const metadata: Metadata = {
  title: "StagePass",
  description: "A web tool from Refactor Games to streamline asset approvals as part of our game art asset pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lunasima.variable} ${mada.variable}`}>
        <BlueprintGrid>
          {children}
          <div className="refactor-logo-footer">
            <Image
              src="/logo/refactor-black.webp"
              alt="Refactor Games Logo"
              width={1725}
              height={353}
            />
          </div>
        </BlueprintGrid>
      </body>
    </html>
  );
}
