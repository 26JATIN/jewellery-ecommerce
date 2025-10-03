import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NavbarProvider } from "./context/NavbarContext";
import ConditionalNavbar from "./components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jewelry Ecommerce",
  description: "Ecommerce website for jewelry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <NavbarProvider>
              <ConditionalNavbar />
              <main className="pb-mobile-navbar">
                {children}
              </main>
            </NavbarProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
