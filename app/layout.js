import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NavbarProvider } from "./context/NavbarContext";
import ConditionalNavbar from "./components/ConditionalNavbar";
import PWARegister from "./components/PWARegister";
import InstallPrompt from "./components/InstallPrompt";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nandika Jewellers",
  description: "A Bond of trust & Quality - Premium jewelry crafted with precision and passion",
  manifest: "/manifest.json",
  themeColor: "#d4af37",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nandika Jewellers",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4af37" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <Toaster position="top-right" richColors />
        <PWARegister />
        <InstallPrompt />
        <AuthProvider>
          <CartProvider>
            <NavbarProvider>
              <ConditionalNavbar />
              <main>
                {children}
              </main>
            </NavbarProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
