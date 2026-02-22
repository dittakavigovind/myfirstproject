import { Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../context/AuthContext';
import { AgoraProvider } from '../context/AgoraContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';
import { ThemeProvider } from '../context/ThemeContext';
import { BirthDetailsProvider } from '../context/BirthDetailsContext';
import { SessionProvider } from '../context/SessionContext';
import PromotionalPopup from '../components/PromotionalPopup';
import ProfileSetupModal from '../components/ProfileSetupModal';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins'
})

import { resolveImageUrl } from '../lib/urlHelper';

import GoogleAdSense from '../components/GoogleAdSense';

export async function generateMetadata() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.way2astro.com';
    let iconUrl = '/logo.png'; // Default fallback
    let googleAdsId = '';

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/site-settings`, { next: { revalidate: 60 } });
        const data = await res.json();

        if (data.success && data.settings) {
            const { logoMobile, logoDesktop, favicon, googleAdsId: adsId } = data.settings;
            // Prefer dedicated favicon, then mobile logo (usually smaller/square), then desktop
            const logo = favicon || logoMobile || logoDesktop;
            if (logo) {
                iconUrl = resolveImageUrl(logo);
            }
            if (adsId) {
                googleAdsId = adsId;
            }
        }
    } catch (error) {
        console.error('Error fetching dynamic favicon:', error);
    }

    return {
        title: 'Way2Astro - Your Path to Destiny',
        description: 'Premium Astrology Consultations, Kundli & Daily Horoscopes.',
        metadataBase: new URL(baseUrl),
        openGraph: {
            images: ['/logo.png']
        },
        icons: {
            icon: iconUrl,
            shortcut: iconUrl,
            apple: iconUrl,
        },
        other: {
            googleAdsId // Passing this to be used in layout if needed, though we fetch it again or pass via props
        }
    };
}



export default async function RootLayout({ children }) {
    // We need to fetch settings again or use the metadata fetch result if we could share state, 
    // but in server components, duplicate fetch is deduped by Next.js if enabled, or we just fetch again.
    // For simplicity and clarity, we'll do a quick fetch or just use the one from metadata if we could.
    // Actually, let's just fetch it here to pass to the client component.

    let googleAdsId = '';
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/site-settings`, { next: { revalidate: 60 } });
        const data = await res.json();
        if (data.success && data.settings) {
            googleAdsId = data.settings.googleAdsId;
        }
    } catch (e) {
        console.error("Error fetching settings for layout:", e);
    }

    return (
        <html lang="en">
            <body className={`${poppins.variable} font-sans`}>
                <GoogleAdSense publisherId={googleAdsId} />
                <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
                <AuthProvider>
                    <ThemeProvider>
                        <BirthDetailsProvider>
                            <SessionProvider>
                                <AgoraProvider>
                                    <ProfileSetupModal />
                                    <ScrollToTop />
                                    <PromotionalPopup />
                                    <Navbar />
                                    <main className="min-h-screen">
                                        {children}
                                    </main>
                                    <Footer />
                                    <Toaster position="top-center" toastOptions={{
                                        className: '',
                                        style: {
                                            background: '#333',
                                            color: '#fff',
                                            borderRadius: '12px',
                                        },
                                        success: {
                                            style: {
                                                background: '#F0FDF4',
                                                color: '#15803d',
                                                border: '1px solid #BBF7D0'
                                            },
                                        },
                                        error: {
                                            style: {
                                                background: '#FEF2F2',
                                                color: '#B91C1C',
                                                border: '1px solid #FECACA'
                                            },
                                        }
                                    }} />
                                </AgoraProvider>
                            </SessionProvider>
                        </BirthDetailsProvider>
                    </ThemeProvider>
                </AuthProvider>
                <div id="root-portal" />
            </body>
        </html>
    )
}
