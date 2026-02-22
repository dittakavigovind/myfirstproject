"use client";

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FileCheck, Activity, PenTool, Sparkles, X } from 'lucide-react';

// Helper Components defined outside to prevent re-renders
const Section = ({ title, children }) => (
    <div className="mb-8">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
);

const InputGroup = ({ label, required, error, success, loading, helperText, ...props }) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide flex justify-between">
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
            {loading && <span className="text-indigo-500 animate-pulse text-[10px]">Checking availability...</span>}
        </label>
        <div className="relative">
            <input
                {...props}
                required={required}
                className={`w-full border ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : success ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-200'} bg-slate-50/50 p-3 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:bg-white transition-all shadow-sm placeholder:text-slate-300`}
            />
            {success && <div className="absolute right-3 top-3 text-emerald-500"><FileCheck size={16} /></div>}
            {error && <div className="absolute right-3 top-3 text-red-500"><X size={16} /></div>}
        </div>
        {(error || helperText) && <p className={`text-[10px] mt-1 font-bold ${error ? 'text-red-500' : 'text-slate-400'}`}>{error || helperText}</p>}
        {success && <p className="text-[10px] mt-1 font-bold text-emerald-500">Name available!</p>}
    </div>
);

export default function JoinAstrologerPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        skills: '',
        languages: '',
        experience: '',
        bio: '',
        image: user?.profileImage || ''
    });

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Name Availability State
    const [nameStatus, setNameStatus] = useState({ checking: false, available: null, message: '' });

    useEffect(() => {
        const checkName = async () => {
            if (!formData.name || formData.name.length < 3) {
                setNameStatus({ checking: false, available: null, message: '' });
                return;
            }

            setNameStatus(prev => ({ ...prev, checking: true, available: null }));

            try {
                // Debounce 500ms
                await new Promise(r => setTimeout(r, 500));

                const res = await API.post('/requests/check-name', { name: formData.name });
                if (res.data.success) {
                    setNameStatus({
                        checking: false,
                        available: res.data.available,
                        message: res.data.message
                    });
                }
            } catch (error) {
                console.error("Name check failed", error);
                setNameStatus({ checking: false, available: false, message: 'Verification failed. Server might need restart.' });
            }
        };

        const timer = setTimeout(checkName, 500);
        return () => clearTimeout(timer);
    }, [formData.name]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await API.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setFormData(prev => ({ ...prev, image: res.data.filePath }));
            }
        } catch (error) {
            console.error("Upload failed", error);
            setMessage('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                userId: user._id || user.id,
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()),
                languages: formData.languages.split(',').map(s => s.trim())
            };

            console.log("Submitting Payload:", payload); // DEBUG
            console.log("Current User:", user); // DEBUG

            const res = await API.post('/requests/submit', payload);
            if (res.data.success) {
                setMessage('Request submitted successfully! We will review it shortly.');
                setTimeout(() => router.push('/'), 3000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            checkStatus();
        }
    }, [user, authLoading, router]);

    const checkStatus = async () => {
        try {
            const res = await API.get('/requests/my-status');
            if (res.data.success && res.data.hasPendingRequest) {
                setIsPending(true);
            }
        } catch (error) {
            console.error("Failed to check status", error);
        }
    };

    if (authLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!user) return null;

    if (isPending) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl pointer-events-none"></div>

                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 animate-pulse">
                        <Activity size={32} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mb-3">Request Pending</h2>
                    <p className="text-slate-500 font-medium mb-8">
                        You already have a pending request to join as an Astrologer. Please wait for the admin to approve it.
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-astro-navy text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider"
                    >
                        Return to Home
                    </button>

                    <p className="text-xs text-slate-400 font-bold mt-6 uppercase tracking-wider">
                        We will notify you soon
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

            {/* Premium Hero Section */}
            <div className="relative text-white">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-0 overflow-hidden transform scale-x-[1.02]">
                    <div className="absolute top-[-50%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center pt-20 pb-40 px-6 text-center">
                    <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg mb-6 group hover:bg-white/15 transition-all cursor-default">
                        <Sparkles className="w-3 h-3 text-astro-yellow animate-pulse" />
                        <span className="text-indigo-100 text-[10px] font-bold tracking-[0.2em] uppercase">Join Our Network</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                        Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300 drop-shadow-sm">Verification Expert</span>
                    </h1>

                    <p className="text-slate-300/90 text-sm md:text-lg font-medium leading-relaxed max-w-2xl">
                        Share your wisdom with millions. Join India's most trusted astrology platform and help guide people towards their destiny.
                    </p>
                </div>
            </div>

            {/* Main Content Form - Overlapping Hero */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-30 -mt-24 pb-20">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-900/10 border border-slate-100 relative overflow-hidden">

                    {/* Decorative Blur */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Header of Form */}
                        <div className="flex items-center gap-5 mb-10 border-b border-slate-100 pb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                                <PenTool size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Astrologer Application</h3>
                                <p className="text-slate-500 font-medium">Please provide accurate details for verification.</p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 mb-8 rounded-2xl text-sm font-bold flex items-center justify-center shadow-sm border ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <Section title="Personal Information">
                                <InputGroup label="Display Name"
                                    type="text"
                                    value={formData.name}
                                    placeholder="Your Public Name (Unique)"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    loading={nameStatus.checking}
                                    success={nameStatus.available === true}
                                    error={nameStatus.available === false ? nameStatus.message : null}
                                    helperText="This name will be displayed publicly."
                                />
                                <InputGroup label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    placeholder="you@example.com"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <div className="md:col-span-2">
                                    <InputGroup label="Phone Number"
                                        type="tel"
                                        value={formData.phone}
                                        placeholder="+91 98765 43210"
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </Section>

                            <Section title="Professional Expertise">
                                <div className="md:col-span-2">
                                    <InputGroup label="Skills (Comma separated)"
                                        type="text"
                                        placeholder="Vedic, Tarot, Numerology, Vastu..."
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        required
                                    />
                                </div>
                                <InputGroup label="Languages (Comma separated)"
                                    type="text"
                                    placeholder="English, Hindi, Telugu, Tamil..."
                                    value={formData.languages}
                                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                    required
                                />
                                <InputGroup label="Experience (Years)"
                                    type="number"
                                    placeholder="e.g. 5"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    required
                                />
                            </Section>

                            <Section title="Profile Media & Bio">
                                <div className="md:col-span-2 mb-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Profile Photo <span className="text-rose-500">*</span></label>
                                    <div className="flex items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all group/upload relative overflow-hidden">

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            {formData.image ? (
                                                <div className="relative w-full h-full">
                                                    <img src={formData.image} alt="Preview" className="w-full h-full rounded-2xl object-cover shadow-md border border-slate-200" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData(prev => ({ ...prev, image: '' }));
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                                                        title="Remove Image"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full h-full rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 group-hover/upload:text-indigo-400 transition-colors cursor-pointer"
                                                >
                                                    <Sparkles size={28} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative z-10">
                                            <h5 className="font-bold text-slate-700 mb-1 group-hover/upload:text-indigo-700 transition-colors">Upload Profile Photo</h5>
                                            <p className="text-xs text-slate-400 mb-4">Allowed *.jpeg, *.jpg, *.png. 1:1 ratio recommended.</p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-block bg-white border border-slate-200 text-slate-600 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                                            >
                                                {uploading ? 'Uploading...' : 'Choose File'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Bio / Introduction</label>
                                    <textarea
                                        className="w-full border border-slate-200 bg-slate-50/50 p-5 rounded-2xl text-sm text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500/50 transition-all shadow-sm h-40 resize-none font-medium placeholder:text-slate-300 placeholder:font-normal"
                                        value={formData.bio}
                                        placeholder="Tell us about yourself, your experience, and why you want to join..."
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    ></textarea>
                                </div>
                            </Section>

                            <div className="pt-8 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading || uploading || nameStatus.available === false}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:shadow-2xl hover:shadow-indigo-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg tracking-wide disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {loading ? <Activity className="animate-spin" /> : <FileCheck className="w-6 h-6" />}
                                    {loading ? 'Submitting Application...' : 'Submit Now'}
                                </button>
                                <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider">
                                    By submitting, you agree to our Terms & Conditions
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
