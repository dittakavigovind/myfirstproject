"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, User, DollarSign, MessageSquare, Phone, Video } from 'lucide-react';
import API from '../../../lib/api'; // Assuming generic API handler

export default function AstrologerProfile() {
    const { user, updateUser, loading } = useAuth();
    const router = useRouter();

    // Local state for form
    const [formData, setFormData] = useState({
        name: '',
        expertise: '',
        languages: '',
        experience: 0,
        about: '',
        // Pricing & Availability
        chatPrice: 15,
        callPrice: 15,
        videoPrice: 15,
        isChatEnabled: false,
        isCallEnabled: false,
        isVideoEnabled: false
    });

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const [isOnlineStatus, setIsOnlineStatus] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role !== 'astrologer') {
                router.push('/dashboard');
                return;
            }

            const fetchProfile = async () => {
                try {
                    const { data } = await API.get('/astro/me');
                    if (data.success && data.data) {
                        const astro = data.data;

                        // Check online status from API source of truth
                        const isOnline = astro.isChatOnline || astro.isVoiceOnline || astro.isVideoOnline;
                        setIsOnlineStatus(isOnline);

                        setFormData({
                            name: astro.displayName || user.name || '',
                            expertise: Array.isArray(astro.skills) ? astro.skills.join(', ') : (astro.skills || ''),
                            languages: Array.isArray(astro.languages) ? astro.languages.join(', ') : (astro.languages || ''),
                            experience: astro.experienceYears || 0,
                            about: astro.bio || '',
                            chatPrice: astro.charges?.chatPerMinute || 15,
                            callPrice: astro.charges?.callPerMinute || 15,
                            videoPrice: astro.charges?.videoPerMinute || 15,
                            isChatEnabled: true,
                            isCallEnabled: true,
                            isVideoEnabled: true
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch astrologer profile", error);
                    setFormData(prev => ({ ...prev, name: user.name }));
                }
            };
            fetchProfile();
        }
    }, [user, loading, router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');

        // Validation
        const chatC = parseFloat(formData.chatPrice) || 0;
        const callC = parseFloat(formData.callPrice) || 0;
        const videoC = parseFloat(formData.videoPrice) || 0;

        if (chatC < 15) {
            setMsg('Error: Chat Charge cannot be less than ₹15');
            setSaving(false);
            return;
        }
        if (callC < 15) {
            setMsg('Error: Voice Call Charge cannot be less than ₹15');
            setSaving(false);
            return;
        }
        if (videoC < 15) {
            setMsg('Error: Video Call Charge cannot be less than ₹15');
            setSaving(false);
            return;
        }

        try {
            // Update both User and Astrologer models via dedicated endpoint
            const { data } = await API.put('/astro/me', formData);

            updateUser(data); // Update context
            setMsg('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            setMsg('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <header className="bg-white border-b border-slate-200 px-6 py-4 mb-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800">Set Price</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Set Rate Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-slate-700 mb-8 flex items-center gap-2 pb-4 border-b border-slate-100">
                            <DollarSign size={24} className="text-green-600" /> Set Your Consultation Rates
                        </h2>

                        {/* Chat Rate */}
                        <div className="mb-8">
                            <label className="block text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <MessageSquare size={20} className="text-indigo-500" /> Chat Rate <span className="text-slate-400 font-normal text-sm ml-auto">(Min ₹15/min)</span>
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                                <input
                                    type="number"
                                    name="chatPrice"
                                    value={formData.chatPrice}
                                    onChange={handleChange}
                                    min="15"
                                    placeholder="Min 15"
                                    disabled={isOnlineStatus}
                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-16 py-4 text-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">/min</span>
                            </div>
                            {isOnlineStatus && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1">Rates cannot be changed while you are online.</p>}
                        </div>

                        {/* Call Rate */}
                        <div className="mb-8">
                            <label className="block text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Phone size={20} className="text-green-500" /> Call Rate <span className="text-slate-400 font-normal text-sm ml-auto">(Min ₹15/min)</span>
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                                <input
                                    type="number"
                                    name="callPrice"
                                    value={formData.callPrice}
                                    onChange={handleChange}
                                    min="15"
                                    placeholder="Min 15"
                                    disabled={isOnlineStatus}
                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-16 py-4 text-lg font-bold text-slate-800 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all bg-slate-50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">/min</span>
                            </div>
                        </div>

                        {/* Video Rate */}
                        <div className="mb-8">
                            <label className="block text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Video size={20} className="text-purple-500" /> Video Call Rate <span className="text-slate-400 font-normal text-sm ml-auto">(Min ₹15/min)</span>
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                                <input
                                    type="number"
                                    name="videoPrice"
                                    value={formData.videoPrice}
                                    onChange={handleChange}
                                    min="15"
                                    placeholder="Min 15"
                                    disabled={isOnlineStatus}
                                    className="w-full border border-slate-200 rounded-xl pl-10 pr-16 py-4 text-lg font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-slate-50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">/min</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {saving ? 'Updating Prices...' : <><Save size={20} /> Update Prices</>}
                    </button>

                    {msg && (
                        <div className={`p-4 rounded-xl text-center font-bold ${msg.includes('success') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {msg}
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
