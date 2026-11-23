"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function LocationSearch({ onLocationSelect, placeholder = "Search City...", darkMode = true, showIcon = true, showLeftIcon = false, defaultValue = "", restrictCountry = null, variant = "default" }) {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [error, setError] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync query when defaultValue changes
    useEffect(() => {
        setQuery(defaultValue || "");
    }, [defaultValue]);

    // Debounce timer ref
    const debounceTimer = useRef(null);

    const fetchSuggestions = async (input) => {
        const trimmed = input ? input.trim() : '';
        if (trimmed.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            setLoadingSuggestions(false);
            return;
        }

        setLoadingSuggestions(true);
        try {
            const url = restrictCountry
                ? `/astro/search-locations?query=${encodeURIComponent(trimmed)}&country=${restrictCountry}`
                : `/astro/search-locations?query=${encodeURIComponent(trimmed)}`;
            const res = await api.get(url);
            if (res.data.success && Array.isArray(res.data.data)) {
                setSuggestions(res.data.data);
                setShowDropdown(res.data.data.length > 0);
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        } catch (err) {
            console.error(err);
            setSuggestions([]);
            setShowDropdown(false);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setError('');

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!val || val.trim().length === 0) {
            setSuggestions([]);
            setShowDropdown(false);
            setLoadingSuggestions(false);
            if (onLocationSelect) {
                onLocationSelect({
                    formattedAddress: '',
                    lat: null,
                    lng: null,
                    timezone: '',
                    city: '',
                    state: '',
                    country: 'India',
                    pincode: ''
                });
            }
            return;
        }

        if (val.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            setLoadingSuggestions(false);
            return;
        }

        setLoadingSuggestions(true);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 250);
    };

    const handleSelectLocation = async (placeName, placeId = null) => {
        // Don't setQuery yet if we are restricting, wait for geocode success
        if (!restrictCountry) {
            setQuery(placeName);
        }
        setShowDropdown(false);
        setSearching(true);
        setError('');

        try {
            const res = await api.post('/astro/geocode', {
                place: placeName,
                place_id: placeId,
                country: restrictCountry
            });
            if (res.data.success) {
                const { lat, lng, timezone, formattedAddress, city, state, country, pincode } = res.data.data;
                // Extra safety: Check country on frontend too
                if (restrictCountry === 'IN' && country && country.toLowerCase() !== 'india' && !formattedAddress.toLowerCase().includes('india')) {
                    setError("Delivery only to India");
                    setQuery(''); // Reset query on failure
                    setSearching(false);
                    return;
                }

                setQuery(formattedAddress || placeName); // Success! Use formatted address if available
                onLocationSelect({
                    formattedAddress,
                    lat,
                    lng,
                    timezone,
                    city,
                    state,
                    country,
                    pincode
                });
            } else {
                setError(res.data.message || 'Location not found');
            }
        } catch (error) {
            console.error("Geocode error details:", error.response ? error.response.data : error.message);
            const backendMsg = error.response?.data?.message || "";
            if (backendMsg.includes("Delivery only to India") || backendMsg.includes("India")) {
                setError("Delivery only to India");
            } else {
                setError("Location not found - please select from suggestions");
            }
        } finally {
            setSearching(false);
        }
    };

    const handleManualSearch = (e) => {
        if (e) e.preventDefault();
        if (suggestions && suggestions.length > 0) {
            handleSelectLocation(suggestions[0].description, suggestions[0].place_id);
        } else {
            handleSelectLocation(query);
        }
    };

    // Adjusted for mobile app's dark theme by default
    const inputBaseHeader = variant === "underline" 
        ? `w-full ${showIcon ? 'pr-8' : 'pr-0'} py-1 bg-transparent text-white placeholder:text-white/20 focus:outline-none transition-colors text-[13px]`
        : darkMode
        ? `w-full ${showIcon ? 'pr-12' : 'pr-3'} py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-electric-violet/20 text-white placeholder-slate-500 focus:outline-none transition-all duration-300 backdrop-blur-sm`
        : `w-full ${showIcon ? 'pr-12' : 'pr-3'} py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-solar-gold/10 focus:bg-white focus:border-solar-gold outline-none transition-all font-bold text-[#0E1A2B] placeholder-slate-400 shadow-sm`;

    const inputClasses = `${inputBaseHeader} ${showLeftIcon ? (variant === 'underline' ? 'pl-8' : 'pl-11') : 'pl-0'}`;

    const dropdownClasses = darkMode
        ? "absolute top-full left-0 z-[200] w-full min-w-[260px] bg-slate-900/95 border border-white/15 mt-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] max-h-60 overflow-y-auto backdrop-blur-2xl p-1.5 divide-y divide-white/[0.05]"
        : "absolute top-full left-0 z-[200] w-full min-w-[260px] bg-white border border-slate-200 mt-1.5 rounded-2xl shadow-2xl shadow-solar-gold/10 max-h-80 overflow-y-auto overflow-x-hidden p-1.5 divide-y divide-slate-100";

    const itemClasses = darkMode
        ? "px-3.5 py-2.5 hover:bg-white/10 active:bg-white/15 cursor-pointer text-xs font-semibold text-slate-200 hover:text-white transition-colors rounded-xl flex items-center gap-2.5"
        : "px-3.5 py-2.5 hover:bg-solar-gold/5 cursor-pointer text-xs text-slate-700 font-bold transition-all rounded-xl hover:text-solar-gold flex items-center gap-2.5";

    const buttonClasses = darkMode
        ? "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-electric-violet transition-colors"
        : "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-solar-gold transition-all active:scale-90";

    return (
        <div className="relative h-full w-full flex items-center" ref={wrapperRef}>
            <div className="relative w-full h-full group">
                {showLeftIcon && (
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400 group-focus-within:text-electric-violet' : 'text-slate-400 group-focus-within:text-solar-gold'} transition-colors pointer-events-none z-10`}>
                        <MapPin size={17} />
                    </div>
                )}
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleManualSearch();
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder={placeholder}
                    className={`${inputClasses} min-w-0 font-medium`}
                />
                {showIcon && (
                    <button
                        type="button"
                        onClick={() => handleManualSearch()}
                        disabled={searching || loadingSuggestions}
                        className={buttonClasses}
                    >
                        {searching || loadingSuggestions ? (
                            <Loader2 size={17} className="animate-spin text-purple-400" />
                        ) : (
                            <Search size={17} />
                        )}
                    </button>
                )}
            </div>

            {showDropdown && suggestions.length > 0 && (
                <ul className={dropdownClasses}>
                    {suggestions.map((place) => (
                        <li
                            key={place.place_id || place.description}
                            onClick={() => handleSelectLocation(place.description, place.place_id)}
                            className={itemClasses}
                        >
                            <MapPin size={14} className="text-solar-gold shrink-0 opacity-80" />
                            <span className="truncate">{place.description}</span>
                        </li>
                    ))}
                </ul>
            )}

            {error && (
                <p className="absolute top-full mt-1 text-red-500 text-[10px] ml-1 font-bold">
                    {error}
                </p>
            )}
        </div>
    );
}
