"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Settings, Save, Smartphone, Code, ShieldAlert, Sparkles, AlertTriangle, UploadCloud, Loader2 } from 'lucide-react';

export default function MobileConfigDashboard() {
    const [appConfig, setAppConfig] = useState(null);
    const [siteSettings, setSiteSettings] = useState({ chatAlertSoundUrl: '', callAlertSoundUrl: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingChatSound, setUploadingChatSound] = useState(false);
    const [uploadingCallSound, setUploadingCallSound] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const [appRes, siteRes] = await Promise.all([
                API.get('/admin/config/app'),
                API.get('/site-settings')
            ]);
            setAppConfig(appRes.data.config);
            if (siteRes.data.settings) {
                setSiteSettings({
                    chatAlertSoundUrl: siteRes.data.settings.chatAlertSoundUrl || '/sounds/chat_alert.mp3',
                    callAlertSoundUrl: siteRes.data.settings.callAlertSoundUrl || '/sounds/call_alert.mp3'
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load configs");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAppConfig = async () => {
        setSaving(true);
        try {
            await Promise.all([
                API.put('/admin/config/app', appConfig),
                API.put('/site-settings', {
                    chatAlertSoundUrl: siteSettings.chatAlertSoundUrl,
                    callAlertSoundUrl: siteSettings.callAlertSoundUrl
                })
            ]);
            toast.success("Configurations updated instantly");
        } catch (err) {
            toast.error("Failed to update app config");
        }
        setSaving(false);
    };

    const handleAudioUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const isChat = type === 'chat';
        isChat ? setUploadingChatSound(true) : setUploadingCallSound(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const fetchRes = await fetch(`${API.defaults.baseURL}/upload/audio`, {
                method: 'POST',
                body: formData
            });
            const data = await fetchRes.json();

            if (data.success) {
                toast.success('Audio uploaded successfully');
                setSiteSettings(prev => ({
                    ...prev,
                    [isChat ? 'chatAlertSoundUrl' : 'callAlertSoundUrl']: data.filePath
                }));
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            toast.error('Failed to upload audio');
        } finally {
            isChat ? setUploadingChatSound(false) : setUploadingCallSound(false);
        }
    };

    if (loading) return <div>Loading Configuration Engine...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-blue-500" /> Control Engine
                </h1>
                <p className="text-slate-400 mt-2">Adjust mobile app behaviors and connection rules instantly without App Store updates.</p>
            </div>

            {appConfig && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Smartphone size={20} className="text-blue-400" /> App Features & Capabilities
                            </h2>
                            <button
                                onClick={handleSaveAppConfig}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition disabled:opacity-50"
                            >
                                {saving ? 'Deploying...' : <><Save size={18} /> Apply Instantly</>}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Global System Toggles</h3>
                                
                                <ToggleSwitch 
                                    label="Maintenance Mode" 
                                    description="Disables the entire app and shows a maintenance screen."
                                    icon={<ShieldAlert size={16} className="text-red-400" />}
                                    checked={appConfig.isMaintenanceMode} 
                                    onChange={(v) => setAppConfig({ ...appConfig, isMaintenanceMode: v })} 
                                />

                                <ToggleSwitch 
                                    label="Disable New Signups" 
                                    description="Prevents new users from creating accounts."
                                    icon={<Code size={16} className="text-yellow-400" />}
                                    checked={appConfig.disableNewSignups} 
                                    onChange={(v) => setAppConfig({ ...appConfig, disableNewSignups: v })} 
                                />
                                
                                <ToggleSwitch 
                                    label="Force App Update" 
                                    description="Forces users on old versions to download the latest app."
                                    icon={<AlertTriangle size={16} className="text-orange-400" />}
                                    checked={appConfig.forceUpdate} 
                                    onChange={(v) => setAppConfig({ ...appConfig, forceUpdate: v })} 
                                />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Communication Modules</h3>
                                
                                <ToggleSwitch 
                                    label="Enable Chat Feature" 
                                    description="Allows messaging. If false, chat buttons disappear."
                                    icon={<Sparkles size={16} className="text-emerald-400" />}
                                    checked={appConfig.features?.chatEnabled} 
                                    onChange={(v) => setAppConfig({ ...appConfig, features: { ...appConfig.features, chatEnabled: v } })} 
                                />

                                <ToggleSwitch 
                                    label="Enable Voice Calls" 
                                    description="Enables Voice-over-IP using Agora RTC."
                                    icon={<Sparkles size={16} className="text-emerald-400" />}
                                    checked={appConfig.features?.voiceEnabled} 
                                    onChange={(v) => setAppConfig({ ...appConfig, features: { ...appConfig.features, voiceEnabled: v } })} 
                                />

                                <ToggleSwitch 
                                    label="Enable Video Calls" 
                                    description="Requires high bandwidth. Disable if network is congested."
                                    icon={<Sparkles size={16} className="text-emerald-400" />}
                                    checked={appConfig.features?.videoEnabled} 
                                    onChange={(v) => setAppConfig({ ...appConfig, features: { ...appConfig.features, videoEnabled: v } })} 
                                />
                            </div>
                        </div>

                        {/* Notification Sounds Section */}
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                                <Sparkles size={16} className="text-pink-400" /> Astrologer Alert Sounds (Foreground)
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Configure the audio file URLs played to Astrologers when a new chat or call is initiated while their app is open. Use .mp3 or .wav format. Background push notification sounds must be bundled natively.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Chat Alert Sound URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={siteSettings.chatAlertSoundUrl}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, chatAlertSoundUrl: e.target.value })}
                                            placeholder="/sounds/chat_alert.mp3"
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg cursor-pointer transition whitespace-nowrap">
                                            {uploadingChatSound ? <Loader2 size={18} className="mr-2 animate-spin"/> : <UploadCloud size={18} className="mr-2"/>}
                                            Upload
                                            <input 
                                                type="file" 
                                                accept=".mp3,.wav,audio/*" 
                                                className="hidden" 
                                                onChange={(e) => handleAudioUpload(e, 'chat')}
                                                disabled={uploadingChatSound}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Call Alert Sound URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={siteSettings.callAlertSoundUrl}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, callAlertSoundUrl: e.target.value })}
                                            placeholder="/sounds/call_alert.mp3"
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg cursor-pointer transition whitespace-nowrap">
                                            {uploadingCallSound ? <Loader2 size={18} className="mr-2 animate-spin"/> : <UploadCloud size={18} className="mr-2"/>}
                                            Upload
                                            <input 
                                                type="file" 
                                                accept=".mp3,.wav,audio/*" 
                                                className="hidden" 
                                                onChange={(e) => handleAudioUpload(e, 'call')}
                                                disabled={uploadingCallSound}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {appConfig.isMaintenanceMode && (
                            <div className="mt-8 pt-4 border-t border-slate-800">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Maintenance Banner Message</label>
                                <input 
                                    type="text" 
                                    value={appConfig.maintenanceMessage} 
                                    onChange={(e) => setAppConfig({ ...appConfig, maintenanceMessage: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="We are upgrading our servers..."
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ToggleSwitch({ label, description, checked, onChange, icon }) {
    return (
        <div className="flex items-start justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition">
            <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <span className="font-bold text-slate-200">{label}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
            </label>
        </div>
    );
}
