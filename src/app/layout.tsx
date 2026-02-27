import type { Metadata } from "next";
import { AuthProvider } from '../presentation/context/AuthContext'
import { Geist, Geist_Mono } from "next/font/google";
import ThemeRegistry from '../lib/ThemeRegistry'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CochaShiai",
  description: "Gestor de torneos de judo para la asociación deportiva departamental de judo de Cochabamba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-title" content="Cocha Shiai" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ margin: 0, height: '100%' }}>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
