"use client";
import { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Upload, Save, Smartphone, Monitor, Image as ImageIcon, Loader2, Palette, RefreshCw, FileText } from 'lucide-react';
import ColorThief from 'colorthief';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../lib/urlHelper';

export default function LogoSettings() {
    const [settings, setSettings] = useState({
        logoDesktop: '',
        logoMobile: '',
        logoReport: '',
        favicon: ''
    });
    const { applyTheme, fetchTheme } = useTheme();
    const [themeColors, setThemeColors] = useState({
        primary: '#1e1b4b',
        secondary: '#fbbf24',
        accent: '#3b82f6'
    });
    const [customThemeColors, setCustomThemeColors] = useState({
        primary: '#1e1b4b',
        secondary: '#fbbf24',
        accent: '#3b82f6'
    });
    const [useCustomColors, setUseCustomColors] = useState(false);

    const [extractedColors, setExtractedColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState({ desktop: false, mobile: false, report: false, favicon: false });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.success) {
                const data = res.data.settings;
                setSettings(data);

                if (data.themeColors) setThemeColors(data.themeColors);
                if (data.customColors) setCustomThemeColors(data.customColors);
                setUseCustomColors(data.useCustomColors || false);

                // If we have a desktop logo and we are NOT using custom colors,
                // we might want to ensure extracted colors are ready or already applied.
                // But since themeColors is already populated from DB, detailed extraction 
                // is only needed if we want to show the palette or re-calculate.
                if (data.logoDesktop) {
                    extractColorsFromImage(resolveImageUrl(data.logoDesktop), false); // false = don't auto apply
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const extractColorsFromImage = (imageSrc, autoApply = true) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageSrc;

        img.onload = () => {
            const colorThief = new ColorThief();
            const palette = colorThief.getPalette(img, 5);
            const hexPalette = palette.map(rgb => `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`);
            setExtractedColors(hexPalette);

            if (autoApply && !useCustomColors) {
                // Auto-assign logic
                const newColors = {
                    primary: hexPalette[0] || themeColors.primary,
                    secondary: hexPalette[1] || themeColors.secondary,
                    accent: hexPalette[2] || themeColors.accent
                };
                setThemeColors(newColors);
            }
        };

        img.onerror = () => {
            // Silently fail or log if image can't be loaded (e.g. broken link)
            console.warn('Could not load image for color extraction');
        };
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(prev => ({ ...prev, [type]: true }));
        setMessage(null);

        try {
            const res = await API.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setSettings(prev => ({
                    ...prev,
                    [type === 'desktop' ? 'logoDesktop' : type === 'mobile' ? 'logoMobile' : type === 'report' ? 'logoReport' : 'favicon']: res.data.filePath
                }));

                // If uploading desktop logo, try to extract colors
                if (type === 'desktop') {
                    // We need the full URL usually or base64 to load into Image for ColorThief
                    // If filePath is relative, prepend appropriately or use FileReader on the uploaded file directly for speeed
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        extractColorsFromImage(event.target.result);
                    }
                    reader.readAsDataURL(file);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...settings,
                themeColors,
                useCustomColors,
                customColors: customThemeColors
            };
            const res = await API.put('/site-settings', payload);
            if (res.data.success) {
                await fetchTheme(); // Refresh global logos and colors
                applyTheme(themeColors); // Apply immediately without reload
                setMessage({ type: 'success', text: 'Logo & Theme settings updated successfully!' });
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        }
    };

    const handleCustomColorChange = (key, value) => {
        const newColors = { ...customThemeColors, [key]: value };
        setCustomThemeColors(newColors);
        // Live preview
        if (useCustomColors) {
            setThemeColors(newColors);
            applyTheme(newColors);
        }
    };

    const toggleCustomColors = (checked) => {
        setUseCustomColors(checked);
        if (checked) {
            setThemeColors(customThemeColors);
            applyTheme(customThemeColors);
        } else {
            // Revert to extracted/auto colors
            // If we have extracted colors in state, use them
            if (extractedColors.length >= 2) {
                const autoColors = {
                    primary: extractedColors[0],
                    secondary: extractedColors[1],
                    accent: extractedColors[2] || themeColors.accent
                };
                setThemeColors(autoColors);
                applyTheme(autoColors);
            } else if (settings.logoDesktop) {
                // Try to re-extract if missing
                extractColorsFromImage(resolveImageUrl(settings.logoDesktop), true);
            }
        }
    };

    if (loading) return <div className="p-6 text-slate-500">Loading settings...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <ImageIcon size={24} className="text-astro-yellow" />
                Logo Settings
            </h2>

            {message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-500" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Desktop Logo */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                        <Monitor size={20} className="text-blue-500" />
                        <h3>Desktop Logo</h3>
                    </div>

                    {/* Clickable Preview Area */}
                    <label className="block group cursor-pointer">
                        <div className={`bg-slate-100 rounded-xl p-6 flex flex-col items-center justify-center border-2 border-dashed ${uploading.desktop ? 'border-blue-400 bg-blue-50' : 'border-slate-300 group-hover:border-blue-400 group-hover:bg-slate-50'} transition-all min-h-[160px] relative overflow-hidden`}>
                            {uploading.desktop ? (
                                <div className="flex flex-col items-center text-blue-500">
                                    <Loader2 size={32} className="animate-spin mb-2" />
                                    <span className="text-xs font-bold uppercase">Uploading...</span>
                                </div>
                            ) : settings.logoDesktop ? (
                                <>
                                    <img src={resolveImageUrl(settings.logoDesktop)} alt="Desktop Logo" className="max-h-16 w-auto object-contain z-10 relative" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            Change Desktop Logo
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-sm font-medium">Click to upload image</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'desktop')}
                                disabled={uploading.desktop}
                            />
                        </div>
                    </label>
                    <p className="text-xs text-slate-500 text-center">Recommended Size: 200x64px (h-16 equivalent)</p>
                </div>

                {/* Mobile Logo */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                        <Smartphone size={20} className="text-purple-500" />
                        <h3>Mobile Logo</h3>
                    </div>

                    {/* Clickable Preview Area */}
                    <label className="block group cursor-pointer">
                        <div className={`bg-slate-100 rounded-xl p-6 flex flex-col items-center justify-center border-2 border-dashed ${uploading.mobile ? 'border-purple-400 bg-purple-50' : 'border-slate-300 group-hover:border-purple-400 group-hover:bg-slate-50'} transition-all min-h-[160px] relative overflow-hidden`}>
                            {uploading.mobile ? (
                                <div className="flex flex-col items-center text-purple-500">
                                    <Loader2 size={32} className="animate-spin mb-2" />
                                    <span className="text-xs font-bold uppercase">Uploading...</span>
                                </div>
                            ) : settings.logoMobile ? (
                                <>
                                    <img src={resolveImageUrl(settings.logoMobile)} alt="Mobile Logo" className="max-h-12 w-auto object-contain z-10 relative" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            Change Mobile Logo
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-purple-500 transition-colors">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-sm font-medium">Click to upload image</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'mobile')}
                                disabled={uploading.mobile}
                            />
                        </div>
                    </label>
                    <p className="text-xs text-slate-500 text-center">Recommended Size: 200x60px (Aspect Ratio ~3.5:1)</p>
                </div>

                {/* Report Logo */}
                <div className="space-y-4 md:col-span-2 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                        <FileText size={20} className="text-indigo-500" />
                        <h3>Professional Report Logo</h3>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">PDF Only</span>
                    </div>

                    {/* Clickable Preview Area */}
                    <label className="block group cursor-pointer">
                        <div className={`bg-slate-100 rounded-xl p-8 flex flex-col items-center justify-center border-2 border-dashed ${uploading.report ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 group-hover:border-indigo-400 group-hover:bg-slate-50'} transition-all min-h-[160px] relative overflow-hidden`}>
                            {uploading.report ? (
                                <div className="flex flex-col items-center text-indigo-500">
                                    <Loader2 size={32} className="animate-spin mb-2" />
                                    <span className="text-xs font-bold uppercase">Uploading...</span>
                                </div>
                            ) : settings.logoReport ? (
                                <>
                                    <div className="bg-white p-4 rounded-lg shadow-sm mb-2 border border-slate-200">
                                        <img src={resolveImageUrl(settings.logoReport)} alt="Report Logo" className="max-h-12 w-auto object-contain z-10 relative" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            Change Report Logo
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-sm font-medium">Click to upload image for PDF reports</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'report')}
                                disabled={uploading.report}
                            />
                        </div>
                    </label>
                    <p className="text-xs text-slate-500 text-center">This logo will be used specifically for the header of the Professional Result PDF.</p>
                </div>

                {/* Favicon Upload */}
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FileText size={18} className="text-pink-500" />
                        Favicon
                    </h3>
                    <label className={`
                        flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all h-64 relative overflow-hidden group
                        ${settings.favicon ? 'border-pink-200 bg-pink-50/30' : 'border-slate-200 hover:border-pink-400 hover:bg-pink-50'}
                    `}>
                        <div className="text-center z-10 w-full">
                            {uploading.favicon ? (
                                <div className="flex flex-col items-center text-pink-500">
                                    <Loader2 size={32} className="animate-spin mb-2" />
                                    <span className="text-xs font-bold uppercase">Uploading...</span>
                                </div>
                            ) : settings.favicon ? (
                                <>
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 w-16 h-16 flex items-center justify-center">
                                            <img src={resolveImageUrl(settings.favicon)} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            Change Favicon
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-pink-500 transition-colors">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-sm font-medium">Upload Favicon</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/x-icon,image/png,image/jpeg"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'favicon')}
                                disabled={uploading.favicon}
                            />
                        </div>
                    </label>
                    <p className="text-xs text-slate-500 text-center mt-2">Recommended: 32x32px or 16x16px (.ico, .png)</p>
                </div>
            </div>

            {/* Theme Color Settings */}
            <div className="mb-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Palette size={20} className="text-purple-500" />
                            Theme Colors
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {useCustomColors
                                ? "Customize your brand colors manually."
                                : "Automatically extracted from your Desktop Logo."}
                        </p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${!useCustomColors ? 'text-astro-navy' : 'text-slate-400'}`}>Auto</span>
                        <button
                            onClick={() => toggleCustomColors(!useCustomColors)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${useCustomColors ? 'bg-astro-navy' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${useCustomColors ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-bold ${useCustomColors ? 'text-astro-navy' : 'text-slate-400'}`}>Custom</span>
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ${useCustomColors ? 'opacity-100' : 'opacity-60 pointer-events-none grayscale'}`}>
                    {/* Primary Color */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Primary (Navy)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={useCustomColors ? customThemeColors.primary : themeColors.primary}
                                onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                                className="h-10 w-16 p-1 rounded border border-slate-300 cursor-pointer"
                                disabled={!useCustomColors}
                            />
                            <input
                                type="text"
                                value={useCustomColors ? customThemeColors.primary : themeColors.primary}
                                onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                                disabled={!useCustomColors}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Used for headers, buttons, and navigation.</p>
                    </div>

                    {/* Secondary Color */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Secondary (Yellow)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={useCustomColors ? customThemeColors.secondary : themeColors.secondary}
                                onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                                className="h-10 w-16 p-1 rounded border border-slate-300 cursor-pointer"
                                disabled={!useCustomColors}
                            />
                            <input
                                type="text"
                                value={useCustomColors ? customThemeColors.secondary : themeColors.secondary}
                                onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                                disabled={!useCustomColors}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Used for highlights, CTAs, and active states.</p>
                    </div>

                    {/* Accent Color */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Accent (Blue)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={useCustomColors ? customThemeColors.accent : themeColors.accent}
                                onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                                className="h-10 w-16 p-1 rounded border border-slate-300 cursor-pointer"
                                disabled={!useCustomColors}
                            />
                            <input
                                type="text"
                                value={useCustomColors ? customThemeColors.accent : themeColors.accent}
                                onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                                disabled={!useCustomColors}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Used for links and subtle interactive elements.</p>
                    </div>
                </div>

                {!useCustomColors && extractedColors.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Detected Palette from Logo</p>
                        <div className="flex gap-2">
                            {extractedColors.map((color, idx) => (
                                <div
                                    key={idx}
                                    className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">To manually edit these colors, switch to "Custom" mode above.</p>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-astro-navy text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-blue-900/10"
                >
                    <Save size={20} />
                    Save Settings
                </button>
            </div>
        </div>
    );
}
