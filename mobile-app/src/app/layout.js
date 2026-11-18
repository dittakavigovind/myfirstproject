import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Way2Astro",
  description: "Your personalized cosmic guide.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Way2Astro",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#050716",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

import MobileLayout from "@/components/layout/MobileLayout";
import { AuthProvider } from "@/context/AuthContext";
import { BirthDetailsProvider } from "@/context/BirthDetailsContext";
import { SocketProvider } from "@/context/SocketContext";
import SessionBanner from "@/components/SessionBanner";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import DailyBlessingWrapper from "@/components/DailyBlessingWrapper";
import { Toaster } from "react-hot-toast";

import GlobalCallManager from "@/components/GlobalCallManager";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased text-slate-100 selection:bg-electric-violet selection:text-white`}>
        <AuthProvider>
          <SocketProvider>
            <BirthDetailsProvider>
              <SessionBanner />
              <ProfileSetupModal />
              <DailyBlessingWrapper />
              <GlobalCallManager />
              <MobileLayout>
                {children}
              </MobileLayout>
            </BirthDetailsProvider>
          </SocketProvider>
        </AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
