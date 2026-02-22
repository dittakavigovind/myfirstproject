import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Tag, Loader2, Link as LinkIcon, Palette } from 'lucide-react';
import API from '../../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function NavigationSettings() {
    const { fetchTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [badges, setBadges] = useState([]);

    // Default Nav Items
    const defaultPaths = [
        { name: 'HOME', path: '/' },
        { name: 'FREE KUNDLI', path: '/kundli' },
        { name: 'DIVISIONAL CHARTS', path: '/divisional-charts' },
        { name: 'HOROSCOPES', path: '/horoscope' },
        { name: 'PANCHANG', path: '/today-panchang' },
        { name: 'CALENDAR', path: '/calculators/indian-calendar' },
        { name: 'CALCULATORS', path: '/calculators' },
        { name: 'BLOG', path: '/blog' },
        // Explore Services Section
        { name: 'CHAT', path: '/chat-with-astrologer' },
        { name: 'CALL', path: '/astrologers' },
        { name: 'LOVE CALC', path: '/calculators/love-calculator' },
        { name: 'MOON SIGN', path: '/calculators/moon-sign-calculator' },
        { name: 'SUN SIGN', path: '/calculators/sun-sign-calculator' },
        { name: 'SADE SATI', path: '/calculators/sade-sati-calculator' },
        { name: 'DASHA', path: '/calculators/dasha-periods' },
        { name: 'YOGINI DASHA', path: '/calculators/yogini-dasha' },
        { name: 'NUMEROLOGY', path: '/calculators/numerology-calculator' },
        { name: 'FRIENDSHIP', path: '/calculators/friendship-calculator' }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await API.get('/site-settings');
            if (res.data.success && res.data.settings.navBadges) {
                // Merge with default paths to ensure we can edit them
                const existingBadges = res.data.settings.navBadges;

                // Ensure default paths are in the list if they are not already
                const mergedBadges = [...existingBadges];

                defaultPaths.forEach(def => {
                    const exists = mergedBadges.find(b => b.path === def.path);
                    if (!exists) {
                        mergedBadges.push({
                            path: def.path,
                            text: 'New',
                            color: '#ef4444',
                            textColor: '#ffffff',
                            enabled: false
                        });
                    }
                });

                setBadges(mergedBadges);
            } else {
                // Initialize with defaults if no settings found
                setBadges(defaultPaths.map(p => ({
                    path: p.path,
                    text: 'New',
                    color: '#ef4444',
                    textColor: '#ffffff',
                    enabled: false
                })));
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Only save enabled badges or ones that were modified? Actually save all to keep state.
            // Or maybe filter out disabled ones IF we don't want to persist them? No, persist all so we remember disabled state.

            await API.put('/site-settings', {
                navBadges: badges
            });

            toast.success("Navigation settings saved!");
            fetchTheme(); // Refresh global theme context
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const updateBadge = (index, field, value) => {
        const newBadges = [...badges];
        newBadges[index] = { ...newBadges[index], [field]: value };
        setBadges(newBadges);
    };

    const toggleBadge = (index) => {
        const newBadges = [...badges];
        newBadges[index].enabled = !newBadges[index].enabled;
        setBadges(newBadges);
    };

    const addNewBadge = () => {
        setBadges([...badges, {
            path: '',
            text: 'New',
            color: '#ef4444',
            textColor: '#ffffff',
            enabled: true
        }]);
    };

    const removeBadge = (index) => {
        const newBadges = badges.filter((_, i) => i !== index);
        setBadges(newBadges);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Tag size={20} className="text-orange-500" />
                        Navigation Badges
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Add "New" or "Hot" labels to navigation items.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-astro-navy text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                </button>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-1 text-center">Active</div>
                    <div className="col-span-4">Path</div>
                    <div className="col-span-3">Badge Text</div>
                    <div className="col-span-3">Color</div>
                    <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                    {badges.map((badge, index) => (
                        <div key={index} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${badge.enabled ? 'bg-white' : 'bg-slate-50 opacity-70 hover:opacity-100'}`}>
                            {/* Toggle */}
                            <div className="col-span-1 flex justify-center">
                                <label className="relative inline-flex items-center cursor-pointer scale-75">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={badge.enabled}
                                        onChange={() => toggleBadge(index)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>

                            {/* Path */}
                            <div className="col-span-4">
                                <div className="relative">
                                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={badge.path}
                                        onChange={(e) => updateBadge(index, 'path', e.target.value)}
                                        placeholder="/path"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="col-span-3">
                                <input
                                    type="text"
                                    value={badge.text}
                                    onChange={(e) => updateBadge(index, 'text', e.target.value)}
                                    placeholder="e.g. New"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-700"
                                />
                            </div>

                            {/* Color */}
                            <div className="col-span-3 flex gap-2">
                                <div className="relative flex-1">
                                    <div
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200 shadow-sm"
                                        style={{ backgroundColor: badge.color }}
                                    ></div>
                                    <input
                                        type="text"
                                        value={badge.color}
                                        onChange={(e) => updateBadge(index, 'color', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none uppercase"
                                    />
                                </div>
                                <input
                                    type="color"
                                    value={badge.color}
                                    onChange={(e) => updateBadge(index, 'color', e.target.value)}
                                    className="w-10 h-9 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                                />
                            </div>

                            {/* Action */}
                            <div className="col-span-1 flex justify-center">
                                <button
                                    onClick={() => removeBadge(index)}
                                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Remove Badge"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={addNewBadge}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Add New Badge Configuration
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-4">Live Preview</h4>
                <div className="bg-astro-navy p-6 rounded-xl flex justify-between items-center flex-wrap">
                    {badges.filter(b => b.enabled).map((badge, i) => (
                        <div key={i} className="relative group cursor-pointer">
                            <span className="text-white font-bold text-[12px] uppercase tracking-wide group-hover:text-yellow-400 transition-colors">
                                {defaultPaths.find(p => p.path === badge.path)?.name || badge.path}
                            </span>
                            {/* The Badge - Styled as Pill */}
                            <span
                                className="absolute -top-3.5 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize tracking-tight shadow-md animate-pulse whitespace-nowrap"
                                style={{ backgroundColor: badge.color, color: badge.textColor }}
                            >
                                {badge.text}
                            </span>
                        </div>
                    ))}
                    {badges.filter(b => b.enabled).length === 0 && (
                        <span className="text-slate-500 italic text-sm">Enable a badge to see preview here defined relative to nav item...</span>
                    )}
                </div>
            </div>
        </div>
    );
}
