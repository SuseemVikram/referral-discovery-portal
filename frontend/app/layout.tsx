import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import ErrorBoundary from "./components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: "Referral Discovery Portal",
  description: "Browse candidates and send expressions of interest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Referral",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-[100vh] min-h-[100dvh]`}>
        <ErrorBoundary>
          <Providers>
            <AuthProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <Toaster
                position="bottom-center"
                containerStyle={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#333',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    padding: '10px 16px',
                    fontSize: '14px',
                    maxWidth: 'min(320px, calc(100vw - 32px))',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
