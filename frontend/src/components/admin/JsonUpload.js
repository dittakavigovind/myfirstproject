"use client";

import { useState } from 'react';
import { Upload, FileJson, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function JsonUpload({ onUploadSuccess, typeLabel = "Horoscope" }) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            toast.error("Please upload a valid JSON file");
            return;
        }

        setFileName(file.name);
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                await uploadData(jsonData);
            } catch (err) {
                toast.error("Invalid JSON format");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const uploadData = async (data) => {
        setIsUploading(true);
        try {
            const res = await API.post('/horoscope-manager/import', data);
            if (res.data.success) {
                toast.success(res.data.message || "Imported successfully!");
                if (onUploadSuccess) onUploadSuccess(res.data.data);
                setFileName(""); // Reset
            } else {
                toast.error(res.data.message || "Import failed");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to upload JSON");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all hover:border-orange-300 group">
            <div className="flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isUploading ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
                    {isUploading ? <Loader2 className="animate-spin" /> : <FileJson size={24} />}
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Bulk Import {typeLabel}s</h4>
                <p className="text-xs text-slate-500 mb-4 max-w-[200px]">Upload a JSON file to add or update multiple entries at once.</p>
                
                <label className="relative cursor-pointer">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'}`}>
                        <Upload size={14} /> {fileName || "Choose JSON File"}
                    </span>
                    <input 
                        type="file" 
                        accept=".json,application/json" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        disabled={isUploading}
                    />
                </label>
            </div>
        </div>
    );
}
