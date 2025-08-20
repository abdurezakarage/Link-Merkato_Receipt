import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "../components/Navigation";
import SessionGuard from "../components/SessionGuard";
import { AuthProvider } from "./Context/AuthContext";
import { Footer } from "../components/footer";

export const metadata: Metadata = {
  title: "Link Merkato",
  description: "Link Merkato - Professional Services Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white pt-16 font-sans"
      >
        <AuthProvider>
          <Navigation />
          <SessionGuard>
            {children}
          </SessionGuard>

        </AuthProvider>
  
      </body>
    </html>
  );
}
