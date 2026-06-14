"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Search, Loader2, AlertTriangle, ShieldX } from 'lucide-react';
import Image from 'next/image';

export default function MobileAstroWarningsDashboard() {
    const [violators, setViolators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const getImageUrl = (path, gender = null) => {
        if (!path || path.includes('default-avatar.png')) {
            return gender === 'female' ? "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        }
        if (path.startsWith("http")) return path.replace('localhost:5000', '192.168.29.133:5000');
        const normalizedPath = path.replace(/\\/g, "/");
        return `http://192.168.29.133:5000${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    };

    useEffect(() => {
        fetchViolators();
    }, []);

    const fetchViolators = async () => {
        try {
            const [astroRes, userRes] = await Promise.all([
                API.get('/astro/astrologers'),
                API.get('/admin/users')
            ]);
            
            let combined = [];

            if (astroRes.data) {
                const allAstros = Array.isArray(astroRes.data) ? astroRes.data : astroRes.data.data || [];
                const warnedAstros = allAstros.filter(a => (a.warningCount || 0) > 0).map(a => ({ ...a, userType: 'Astrologer' }));
                combined = [...combined, ...warnedAstros];
            }

            if (userRes.data) {
                const allUsers = Array.isArray(userRes.data) ? userRes.data : userRes.data.data || [];
                const warnedUsers = allUsers.filter(u => u.role === 'user' && (u.warningCount || 0) > 0).map(u => ({ ...u, userType: 'User', displayName: u.name || 'Seeker', image: u.profileImage }));
                combined = [...combined, ...warnedUsers];
            }

            combined.sort((a, b) => (b.warningCount || 0) - (a.warningCount || 0));
            setViolators(combined);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch warnings data");
        } finally {
            setLoading(false);
        }
    };

    const filtered = violators.filter(v =>
        (v.displayName || v.name || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex items-center gap-3 text-red-400"><Loader2 className="animate-spin" /> Gathering Violation Records...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <AlertTriangle className="text-red-500" />
                        Violations & Warnings
                    </h1>
                    <p className="text-slate-400 mt-1">Track astrologers who violated rules (Contact Details / Abusive Language) in chat.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search by Public Name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
            </div>

            {violators.length === 0 ? (
                <div className="bg-slate-900/50 border border-emerald-500/20 rounded-3xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldX className="text-emerald-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Violations Found</h3>
                    <p className="text-slate-400 max-w-md">The platform is clean! No users or astrologers have violated the rules.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(person => (
                        <div key={person._id} className="bg-slate-900 border border-red-500/20 rounded-3xl overflow-hidden hover:border-red-500/40 transition-all group shadow-lg shadow-red-500/5">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={getImageUrl(person.image || person.profileImage, person.gender)}
                                                alt={person.displayName}
                                                width={56}
                                                height={56}
                                                className="rounded-xl object-cover w-14 h-14"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{person.displayName}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${person.userType === 'Astrologer' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {person.userType}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 truncate w-32">{person.email || person.userId?.email || person.phone || 'No Contact Info'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                                        <span className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Offenses</span>
                                        <span className="text-2xl font-black text-red-500 leading-none">{person.warningCount}</span>
                                    </div>
                                </div>
                                
                                {person.violationDetails && (
                                    <div className="mt-4 flex gap-2 pt-4 border-t border-slate-800 text-xs">
                                        <div className="flex-1 bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
                                            <span className="text-slate-400 mb-1">Phone</span>
                                            <span className="font-bold text-red-400 text-lg">{person.violationDetails.phone || 0}</span>
                                        </div>
                                        <div className="flex-1 bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
                                            <span className="text-slate-400 mb-1">Email</span>
                                            <span className="font-bold text-red-400 text-lg">{person.violationDetails.email || 0}</span>
                                        </div>
                                        <div className="flex-1 bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
                                            <span className="text-slate-400 mb-1">Abuse</span>
                                            <span className="font-bold text-red-400 text-lg">{person.violationDetails.abusive || 0}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
