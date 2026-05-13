import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Way2Astro Mobile",
  description: "Your personalized cosmic guide.",
  themeColor: "#0b1026",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

import MobileLayout from "@/components/layout/MobileLayout";
import { AuthProvider } from "@/context/AuthContext";
import { BirthDetailsProvider } from "@/context/BirthDetailsContext";
import { SocketProvider } from "@/context/SocketContext";
import SessionBanner from "@/components/SessionBanner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased text-slate-100 selection:bg-electric-violet selection:text-white`}>
        <AuthProvider>
          <SocketProvider>
            <BirthDetailsProvider>
              <SessionBanner />
              <MobileLayout>
                {children}
              </MobileLayout>
            </BirthDetailsProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
