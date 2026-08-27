import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getBlessing(id) {
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.29.133:5000/api";
        const res = await fetch(`${API_URL}/daily-blessing/public/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data; // backend controller getBlessing returns { success: true, data: blessing }
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const blessing = await getBlessing(params.id);
    if (!blessing) return { title: 'Blessing Not Found' };

    return {
        title: blessing.title || 'Divine Blessing',
        description: blessing.message,
        openGraph: {
            title: blessing.title || 'Divine Blessing',
            description: blessing.message,
            images: [blessing.shareImageUrl || blessing.imageUrl],
        }
    };
}

export default async function BlessingPage({ params }) {
    const blessing = await getBlessing(params.id);

    if (!blessing) {
        notFound();
    }

    // Resolving image path based on backend location
    let imageUrl = blessing.shareImageUrl || blessing.imageUrl;
    if (imageUrl.includes('/api/uploads/')) {
        const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.29.133:5000";
        const parts = imageUrl.split('/api/uploads/');
        imageUrl = `${backendUrl}/api/uploads/${parts[1]}`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-black/40 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="w-full relative aspect-[4/5] bg-black">
                    <img 
                        src={imageUrl} 
                        alt={blessing.deityName || 'Divine Blessing'} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-yellow-500 mb-4">{blessing.greeting}</h1>
                    <p className="text-white/90 italic font-serif mb-6 leading-relaxed">"{blessing.message}"</p>
                    {blessing.mantra && (
                        <p className="text-yellow-500 font-bold text-lg mb-8">{blessing.mantra}</p>
                    )}
                    <a 
                        href="https://play.google.com/store/apps/details?id=com.way2astro.mobile" 
                        className="inline-block w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-purple-600/30 hover:opacity-90 transition-opacity"
                    >
                        Get Daily Blessings on Way2Astro App
                    </a>
                </div>
            </div>
        </div>
    );
}
