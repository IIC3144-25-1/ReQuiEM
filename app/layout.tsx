import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { Navbar } from "@/components/navbar/navbar";
import Script from "next/script";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import { ThemeProvider } from "@/components/ui/theme-provider"

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
  title: "SurgerySkills",
  description: "Evaluación Quirúrgica Médica: plataforma para el registro y retroalimentación de procedimientos médicos.",
  manifest: "/manifest.json",
  icons: {
    icon: "/Icon.ico",
  },
  openGraph: {
    title: "SurgerySkills",
    description: "Plataforma para evaluación y seguimiento de procedimientos médicos.",
    url: "https://surgiskills.cl",
    siteName: "SurgerySkills",
    images: [
      {
        url: "/Icon.ico",
        width: 1200,
        height: 630,
        alt: "Logo de SurgerySkills",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SurgerySkills",
    description: "Plataforma para evaluación y retroalimentación médica",
    images: ["/Icon.ico"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Icon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
              <PWAInstallPrompt />
            </div>
            <Toaster />
          </ErrorBoundary>
          <Script src="/service-worker.js" strategy="afterInteractive" />
      </ThemeProvider>
    </body>
  </html>
  );
}
