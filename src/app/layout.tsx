import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Nav } from "@/src/components/Nav";
import { cn } from "@/src/utils";
import { MyProvider } from "@/src/utils/context";

export const metadata: Metadata = {
  title: "Speech Sync",
  description: "Your Personal Communication Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "flex flex-col min-h-screen"
        )}
      >
        <MyProvider>
          <Nav />
          {children}
        </MyProvider>
      </body>
    </html>
  );
}
