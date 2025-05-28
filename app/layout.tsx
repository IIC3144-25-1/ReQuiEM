import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { Navbar } from "@/components/navbar/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://surgiskills.cl"),
  title: "ReQuiEM",
  description: "Evaluación Quirúrgica Médica: plataforma para el registro y retroalimentación de procedimientos médicos.",
  icons: {
    icon: "/Icon.png",
  },
  openGraph: {
    title: "ReQuiEM",
    description: "Plataforma para evaluación y seguimiento de procedimientos médicos.",
    url: "https://surgiskills.cl",
    siteName: "ReQuiEM",
    images: [
      {
        url: "/Icon.png",
        width: 1200,
        height: 630,
        alt: "Logo de ReQuiEM",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReQuiEM",
    description: "Plataforma para evaluación y retroalimentación médica",
    images: ["/Icon.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Navbar />
          <div className="mx-auto">
            {children}
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
