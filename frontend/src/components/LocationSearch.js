"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import API from '../lib/api';

export default function LocationSearch({ onLocationSelect, placeholder = "Search City...", darkMode = false, showIcon = true, showLeftIcon = false, defaultValue = "", restrictCountry = null }) {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
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
        if (!input || input.length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        try {
            const url = restrictCountry
                ? `/astro/search-locations?query=${encodeURIComponent(input)}&country=${restrictCountry}`
                : `/astro/search-locations?query=${encodeURIComponent(input)}`;
            const res = await API.get(url);
            if (res.data.success) {
                setSuggestions(res.data.data);
                setShowDropdown(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setError('');

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!val) {
            setSuggestions([]);
            setShowDropdown(false);
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

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 300);
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
            const res = await API.post('/astro/geocode', {
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

                setQuery(placeName); // Success! Now set the input text
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
                setError(restrictCountry ? "Please select within India" : (res.data.message || 'Location not found'));
            }
        } catch (error) {
            console.error("Geocode error details:", error.response ? error.response.data : error.message);
            // Only set "Delivery only to India" if it's a catch-all for a failed request
            // If the request succeeded but something else failed, use a generic error
            setError(restrictCountry ? "Delivery only to India" : "Location not found");
        } finally {
            setSearching(false);
        }
    };

    const handleManualSearch = (e) => {
        if (e) e.preventDefault();
        handleSelectLocation(query);
    };

    const inputBaseHeader = darkMode
        ? `w-full ${showIcon ? 'pr-12' : 'pr-3'} py-4 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 focus:outline-none transition-all duration-300 backdrop-blur-sm shadow-xl`
        : `w-full ${showIcon ? 'pr-12' : 'pr-3'} py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:bg-white focus:border-yellow-500 outline-none transition-all font-bold text-[#0E1A2B] placeholder-slate-400 shadow-sm`;

    const inputClasses = `${inputBaseHeader} ${showLeftIcon ? 'pl-11' : 'pl-3'}`;

    const dropdownClasses = darkMode
        ? "absolute top-full left-0 z-50 w-full min-w-[300px] bg-slate-900 border border-white/10 mt-1 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-xl"
        : "absolute top-full left-0 z-50 w-[calc(100vw-3rem)] sm:w-[450px] bg-white border border-slate-100 mt-2 rounded-[1.5rem] shadow-2xl shadow-yellow-500/10 max-h-80 overflow-y-auto overflow-x-hidden border-t-0 p-2 animate-in fade-in slide-in-from-top-2 duration-200";

    const itemClasses = darkMode
        ? "px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-slate-300 hover:text-white border-b border-white/5 last:border-b-0 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
        : "px-6 py-3 hover:bg-yellow-50/50 cursor-pointer text-sm text-slate-600 font-bold border-b border-slate-50 last:border-b-0 transition-all rounded-xl hover:text-yellow-600 whitespace-nowrap overflow-hidden text-ellipsis";

    const buttonClasses = darkMode
        ? "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors"
        : "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-600 transition-all active:scale-90";

    return (
        <div className="relative h-full w-full flex items-center" ref={wrapperRef}>
            <div className="relative w-full h-full group">
                {showLeftIcon && (
                    <>
                        {!darkMode && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-600 transition-colors pointer-events-none z-10">
                                <MapPin size={18} />
                            </div>
                        )}
                        {darkMode && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none z-10">
                                <MapPin size={18} />
                            </div>
                        )}
                    </>
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
                    placeholder={placeholder}
                    className={`${inputClasses} min-w-0`}
                />
                {showIcon && (
                    <button
                        type="button"
                        onClick={() => handleManualSearch()}
                        disabled={searching}
                        className={buttonClasses}
                    >
                        {searching ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Search size={18} />
                        )}
                    </button>
                )}
            </div>

            {showDropdown && suggestions.length > 0 && (
                <ul className={dropdownClasses}>
                    {suggestions.map((place) => (
                        <li
                            key={place.place_id}
                            onClick={() => handleSelectLocation(place.description, place.place_id)}
                            className={itemClasses}
                        >
                            {place.description}
                        </li>
                    ))}
                </ul>
            )}

            {error && (
                <p className="absolute top-full mt-1 text-red-500 text-xs ml-1">
                    {error}
                </p>
            )}
        </div>
    );
}
