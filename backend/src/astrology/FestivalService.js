const getFestivals = (panchang) => {
    const festivals = [];
    const { tithi, masa, paksha } = panchang.tithi;
    const tithiIndex = panchang.tithi.index;
    const monthName = panchang.masa.amanta; // Using Amanta for calculation consistency

    // --- GENERIC FESTIVALS (Monthly) ---

    // 1. Sankashti Chaturthi
    if (tithiIndex === 19) {
        festivals.push({
            name: "Sankashti Chaturthi",
            description: "A day dedicated to Lord Ganesha to remove obstacles.",
            icon: "/icons/ganesha.png",
            color: "text-orange-600",
            deity: "Lord Ganesha"
        });
    }

    // 2. Vinayaka Chaturthi (Ganesh Chaturthi - Bhadrapada Shukla Chaturthi)
    if (tithiIndex === 4 && monthName === "Bhadrapada") {
        festivals.push({
            name: "Vinayaka Chaturthi",
            description: "The great yearly festival dedicated to Lord Ganesha's birth.",
            icon: "/icons/ganesha.png",
            color: "text-orange-600",
            priority: 10,
            deity: "Lord Ganesha"
        });
    }

    // 3. Pradosh Vrat
    if (tithiIndex === 13 || tithiIndex === 28) {
        festivals.push({
            name: "Pradosh Vrat",
            description: "A fast observed to honour Lord Shiva and Parvati.",
            icon: "/icons/shiva.png",
            color: "text-indigo-600",
            deity: "Lord Shiva"
        });
    }

    // 4. Masik Shivaratri
    if (tithiIndex === 29) {
        if (monthName === "Magha") {
            festivals.push({
                name: "Maha Shivaratri",
                description: "The Great Night of Shiva.",
                icon: "/icons/shiva_linga.png",
                color: "text-purple-700",
                priority: 10,
                deity: "Lord Shiva"
            });
        } else {
            festivals.push({
                name: "Masik Shivaratri",
                description: "Monthly reverence to Lord Shiva.",
                icon: "/icons/shiva.png",
                color: "text-slate-600",
                deity: "Lord Shiva"
            });
        }
    }

    // 5. Ekadashi
    if (tithiIndex === 11 || tithiIndex === 26) {
        const ekadashiName = getEkadashiName(monthName, tithiIndex === 11 ? 'Shukla' : 'Krishna');
        festivals.push({
            name: `${ekadashiName} Ekadashi`,
            description: "A holy day for fasting and worship of Lord Vishnu.",
            icon: "/icons/vishnu.png",
            color: "text-yellow-600",
            deity: "Lord Vishnu"
        });
    }

    // 6. Purnima
    if (tithiIndex === 15) {
        festivals.push({
            name: `${monthName} Purnima`,
            description: "Full moon day.",
            icon: "/icons/full_moon.png",
            color: "text-yellow-500",
            deity: "Chandra Dev"
        });

        if (monthName === "Phalguna") {
            festivals.push({
                name: "Holi",
                description: "Festival of Colors.",
                icon: "/icons/holi.png",
                color: "text-pink-600",
                deity: "Lord Krishna"
            });
        }
        if (monthName === "Chaitra") {
            festivals.push({
                name: "Hanuman Jayanti",
                description: "Birth of Lord Hanuman.",
                icon: "/icons/om.png",
                color: "text-orange-500",
                priority: 10,
                deity: "Lord Hanuman"
            });
        }
        if (monthName === "Shravana") {
            festivals.push({
                name: "Raksha Bandhan",
                description: "Celebrating the bond between brothers and sisters.",
                icon: "/icons/om.png",
                color: "text-rose-500",
                priority: 15,
                deity: "Bond of Protection"
            });
        }
        if (monthName === "Ashvina") {
            festivals.push({
                name: "Sharad Purnima",
                description: "Harvest festival.",
                icon: "/icons/moon.png",
                color: "text-blue-400",
                deity: "Goddess Lakshmi"
            });
        }
    }

    // 7. Amavasya
    if (tithiIndex === 30) {
        festivals.push({
            name: "Amavasya",
            description: "New moon day, good for offering prayers to ancestors.",
            icon: "/icons/new_moon.png",
            color: "text-slate-800",
            deity: "Ancestors (Pitru)"
        });

        if (monthName === "Ashvina") {
            festivals.push({
                name: "Diwali (Lakshmi Puja)",
                description: "Festival of Lights.",
                icon: "/icons/diwali.png",
                color: "text-amber-600",
                priority: 10,
                deity: "Goddess Lakshmi"
            });
        }
    }

    // --- MAJOR HINDI FESTIVALS ---

    // 8. Chaitra Navratri / Gudi Padwa (Chaitra Shukla Pratipada)
    if (tithiIndex === 1 && monthName === "Chaitra") {
        festivals.push({
            name: "Chaitra Navratri Begins (Gudi Padwa)",
            description: "Spring festival and Hindu New Year.",
            icon: "/icons/om.png", // Assuming a generic om or diya icon exists, or fallback
            color: "text-red-500",
            priority: 15,
            deity: "Goddess Durga / Brahma"
        });
    }

    // 9. Ram Navami (Chaitra Shukla Navami)
    if (tithiIndex === 9 && monthName === "Chaitra") {
        festivals.push({
            name: "Ram Navami",
            description: "Birth of Lord Rama.",
            icon: "/icons/om.png",
            color: "text-amber-500",
            priority: 15,
            deity: "Lord Rama"
        });
    }

    // 10. Hanuman Jayanti (Chaitra Purnima)
    // Note: Already covered by the generic Purnima block, but let's make it specific here instead
    // We already have generic Purnima at tithiIndex 15, let's just add it to the Purnima block above.

    // 11. Raksha Bandhan (Shravana Purnima)
    // Add to Purnima block above.

    // 12. Krishna Janmashtami (Shravana Amanta Krishna Ashtami -> Bhadrapada Purnimanta)
    // Using Amanta: Shravana Krishna Ashtami is tithiIndex 23 (15 + 8)
    if (tithiIndex === 23 && monthName === "Shravana") {
        festivals.push({
            name: "Krishna Janmashtami",
            description: "Birth of Lord Krishna.",
            icon: "/icons/krishna.png", // Assuming icon exists
            color: "text-blue-500",
            priority: 20,
            deity: "Lord Krishna"
        });
    }

    // 13. Sharad Navratri Begins (Ashvina Shukla Pratipada)
    if (tithiIndex === 1 && monthName === "Ashvina") {
        festivals.push({
            name: "Sharad Navratri Begins",
            description: "Nine nights dedicated to Goddess Durga.",
            icon: "/icons/om.png",
            color: "text-red-600",
            priority: 15,
            deity: "Goddess Durga"
        });
    }

    // 14. Maha Navami (Ashvina Shukla Navami)
    if (tithiIndex === 9 && monthName === "Ashvina") {
        festivals.push({
            name: "Maha Navami",
            description: "The ninth day of Navratri festival.",
            icon: "/icons/om.png",
            color: "text-red-600",
            priority: 15,
            deity: "Goddess Durga"
        });
    }

    // 15. Dussehra / Vijaya Dashami (Ashvina Shukla Dashami)
    if (tithiIndex === 10 && monthName === "Ashvina") {
        festivals.push({
            name: "Dussehra (Vijaya Dashami)",
            description: "Celebrating the victory of good over evil.",
            icon: "/icons/om.png",
            color: "text-orange-600",
            priority: 20,
            deity: "Lord Rama / Goddess Durga"
        });
    }

    // 16. Karwa Chauth (Ashvina Amanta Krishna Chaturthi -> Kartika Purnimanta)
    // Using Amanta: Ashvina Krishna Chaturthi is tithiIndex 19 (15 + 4)
    if (tithiIndex === 19 && monthName === "Ashvina") {
        festivals.push({
            name: "Karwa Chauth",
            description: "Fasting observed by married women.",
            icon: "/icons/moon.png",
            color: "text-pink-500",
            priority: 10,
            deity: "Goddess Parvati"
        });
    }

    // 17. Vasant Panchami (Magha Shukla Panchami)
    if (tithiIndex === 5 && monthName === "Magha") {
        festivals.push({
            name: "Vasant Panchami",
            description: "Festival dedicated to Goddess Saraswati.",
            icon: "/icons/om.png",
            color: "text-yellow-400",
            priority: 10,
            deity: "Goddess Saraswati"
        });
    }

    return festivals.sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

// Helper for Ekadashi Names
const getEkadashiName = (masa, paksha) => {
    const names = {
        "Chaitra": { Shukla: "Kamada", Krishna: "Papmochani" }, // Depends on start/end, approximating
        "Vaisakha": { Shukla: "Mohini", Krishna: "Varuthini" },
        "Jyeshtha": { Shukla: "Nirjala", Krishna: "Apara" },
        "Ashadha": { Shukla: "Devshayani", Krishna: "Yogini" },
        "Shravana": { Shukla: "Shravana Putrada", Krishna: "Kamika" },
        "Bhadrapada": { Shukla: "Parivartini", Krishna: "Aja" },
        "Ashvina": { Shukla: "Papankusha", Krishna: "Indira" },
        "Kartika": { Shukla: "Prabodhini", Krishna: "Rama" },
        "Margashirsha": { Shukla: "Mokshada", Krishna: "Utpanna" },
        "Pausha": { Shukla: "Pausha Putrada", Krishna: "Saphala" },
        "Magha": { Shukla: "Jaya", Krishna: "Shattila" },
        "Phalguna": { Shukla: "Amalaki", Krishna: "Vijaya" }
    };
    return names[masa]?.[paksha] || "Ekadashi";
};

module.exports = { getFestivals };
