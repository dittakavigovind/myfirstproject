"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Sparkles, 
    Calendar, 
    Clock, 
    User, 
    CheckCircle2, 
    RotateCcw, 
    Star, 
    Activity, 
    Hash, 
    Heart, 
    Moon, 
    Sun, 
    Briefcase,
    Zap,
    Info,
    RefreshCw,
    PieChart,
    List,
    MapPin,
    Send,
    Share2,
    Crown,
    Compass,
    Shield,
    X
} from "lucide-react";
import { Share } from "@capacitor/share";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import LocationSearch from "@/components/LocationSearch";
import CosmicCard from "@/components/CosmicCard";
import KundliChart from "@/components/KundliChart";
import CosmicSolarUniverse from "@/components/CosmicSolarUniverse";
import api from "@/lib/api";
import toast from "react-hot-toast";

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const ZODIAC_SYMBOLS = {
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
    "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
    "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

const ASCENDANT_DATA = {
    "Aries": { lord: "Mars", element: "Fire", symbol: "♈ The Ram", traits: "Courageous, pioneering, ambitious, high natural energy, independent leader, vibrant physical vitality." },
    "Taurus": { lord: "Venus", element: "Earth", symbol: "♉ The Bull", traits: "Steadfast, trustworthy, sensual, lover of art and luxury, methodical patience, enduring stamina." },
    "Gemini": { lord: "Mercury", element: "Air", symbol: "♊ The Twins", traits: "Quick-witted, versatile communicator, intellectually curious, adaptable, youthful charm." },
    "Cancer": { lord: "Moon", element: "Water", symbol: "♋ The Crab", traits: "Deeply empathetic, protective, intuitive, family-oriented, emotionally attuned, imaginative." },
    "Leo": { lord: "Sun", element: "Fire", symbol: "♌ The Lion", traits: "Regal presence, magnanimous heart, natural commander, inspiring confidence, radiant aura." },
    "Virgo": { lord: "Mercury", element: "Earth", symbol: "♍ The Maiden", traits: "Analytical intellect, meticulous, health-conscious, dedicated service, intellectual precision." },
    "Libra": { lord: "Venus", element: "Air", symbol: "♎ The Scales", traits: "Charming diplomat, refined aesthetic taste, seeks justice and partnership, magnetic elegance." },
    "Scorpio": { lord: "Mars & Ketu", element: "Water", symbol: "♏ The Scorpion", traits: "Mysterious intensity, penetrative vision, profound emotional depth, unconquerable resilience." },
    "Sagittarius": { lord: "Jupiter", element: "Fire", symbol: "♐ The Archer", traits: "Philosophical truth-seeker, optimistic adventurer, generous teacher, broad visionary horizon." },
    "Capricorn": { lord: "Saturn", element: "Earth", symbol: "♑ The Sea-Goat", traits: "Disciplined mastery, strategic ambition, enduring patience, structured authority, grounded wisdom." },
    "Aquarius": { lord: "Saturn & Rahu", element: "Air", symbol: "♒ The Water-Bearer", traits: "Visionary reformer, unconventional intellect, humanitarian values, original independent spirit." },
    "Pisces": { lord: "Jupiter & Neptune", element: "Water", symbol: "♓ The Fishes", traits: "Compassionate mystic, poetic intuition, spiritual transcendence, boundless creative empathy." }
};

const RASHI_DATA = {
    "Aries": {
        sanskrit: "Mesha (మేషం / मेष)",
        lord: "Mars (Mangal)",
        element: "Fire (Agni)",
        quality: "Chara (Movable)",
        symbol: "♈ The Ram",
        deity: "Lord Kartikeya / Agni",
        traits: "Courageous, energetic, enthusiastic, and fiercely independent. Driven by pioneering passion and a dynamic natural spirit."
    },
    "Taurus": {
        sanskrit: "Vrishabha (వృషభం / वृषभ)",
        lord: "Venus (Shukra)",
        element: "Earth (Prithvi)",
        quality: "Sthira (Fixed)",
        symbol: "♉ The Bull",
        deity: "Goddess Lakshmi",
        traits: "Grounded, patient, aesthetically appreciative, and deeply loyal. Values inner peace, enduring stability, comfort, and security."
    },
    "Gemini": {
        sanskrit: "Mithuna (మిథునం / मिथुन)",
        lord: "Mercury (Budh)",
        element: "Air (Vayu)",
        quality: "Dvisvabhava (Dual)",
        symbol: "♊ The Twins",
        deity: "Lord Vishnu",
        traits: "Quick-witted, articulate, curious, and intellectually versatile. Highly adaptable mind with a vibrant talent for expression and communication."
    },
    "Cancer": {
        sanskrit: "Karka (కర్కాటకం / कर्क)",
        lord: "Moon (Chandra)",
        element: "Water (Jal)",
        quality: "Chara (Movable)",
        symbol: "♋ The Crab",
        deity: "Goddess Parvati / Shiva",
        traits: "Deeply empathetic, intuitive, nurturing, and emotionally profound. Protected by the Moon's own home sign, blessed with sensitive wisdom."
    },
    "Leo": {
        sanskrit: "Simha (సింహం / सिंह)",
        lord: "Sun (Surya)",
        element: "Fire (Agni)",
        quality: "Sthira (Fixed)",
        symbol: "♌ The Lion",
        deity: "Lord Surya / Shiva",
        traits: "Regal presence, magnanimous heart, radiant dignity, and natural leadership. Generous, brave, loyal, and creatively expressive."
    },
    "Virgo": {
        sanskrit: "Kanya (కన్య / कन्या)",
        lord: "Mercury (Budh)",
        element: "Earth (Prithvi)",
        quality: "Dvisvabhava (Dual)",
        symbol: "♍ The Maiden",
        deity: "Lord Vishnu",
        traits: "Analytical intellect, practical precision, thoughtful service, and meticulous discernment. Possesses high standards and healing intuition."
    },
    "Libra": {
        sanskrit: "Tula (తుల / तुला)",
        lord: "Venus (Shukra)",
        element: "Air (Vayu)",
        quality: "Chara (Movable)",
        symbol: "♎ The Scales",
        deity: "Goddess Lakshmi",
        traits: "Harmonious, diplomatic, charming, and justice-seeking. Strives for peace, refined aesthetics, emotional equilibrium, and mutual respect."
    },
    "Scorpio": {
        sanskrit: "Vrischika (వృశ్చికం / वृश्चिक)",
        lord: "Mars & Ketu",
        element: "Water (Jal)",
        quality: "Sthira (Fixed)",
        symbol: "♏ The Scorpion",
        deity: "Lord Shiva / Kartikeya",
        traits: "Intense, penetrating intuition, magnetic willpower, and profound emotional depth. Possesses extraordinary resilience and transformative strength."
    },
    "Sagittarius": {
        sanskrit: "Dhanu (ధనుస్సు / धनु)",
        lord: "Jupiter (Guru)",
        element: "Fire (Agni)",
        quality: "Dvisvabhava (Dual)",
        symbol: "♐ The Archer",
        deity: "Lord Dakshinamurthy",
        traits: "Optimistic, philosophical truth-seeker, generous, and visionary. Guided by righteous dharma, higher wisdom, and spiritual exploration."
    },
    "Capricorn": {
        sanskrit: "Makara (మకరం / मकर)",
        lord: "Saturn (Shani)",
        element: "Earth (Prithvi)",
        quality: "Chara (Movable)",
        symbol: "♑ The Sea-Goat",
        deity: "Lord Shani / Brahma",
        traits: "Disciplined, strategic, patient, and emotionally resilient. Builds enduring success through methodical perseverance and grounded maturity."
    },
    "Aquarius": {
        sanskrit: "Kumbha (కుంభం / कुम्भ)",
        lord: "Saturn & Rahu",
        element: "Air (Vayu)",
        quality: "Sthira (Fixed)",
        symbol: "♒ The Water-Bearer",
        deity: "Lord Shiva",
        traits: "Visionary reformer, humanitarian spirit, original thinker, and independent mind. Champions equality, unconventional insight, and progress."
    },
    "Pisces": {
        sanskrit: "Meena (మీనం / मीन)",
        lord: "Jupiter (Guru)",
        element: "Water (Jal)",
        quality: "Dvisvabhava (Dual)",
        symbol: "♓ The Fishes",
        deity: "Lord Vishnu / Shiva",
        traits: "Compassionate mystic, boundless imagination, spiritual sensitivity, and intuitive empathy. Attuned to poetic inspiration and higher planes."
    }
};

const JAIMINI_PLANET_MEANINGS = {
    AK: {
        "Sun": {
            title: "Soul of Leadership & Humility",
            summary: "The Sun as Atmakaraka represents a soul whose destiny is leadership, high authority, and spiritual self-realization. The paramount soul lesson is mastering the ego—learning to lead with pure humility, compassion, and selflessness without pride.",
            keywords: ["Leadership", "Self-Realization", "Humility", "Vitality", "Soul Authority"]
        },
        "Moon": {
            title: "Soul of Empathy & Compassion",
            summary: "The Moon as Atmakaraka indicates a soul whose supreme evolution is emotional mastery and universal love. Your spiritual lesson is cultivating unwavering inner peace, emotional equanimity, and boundless empathy without becoming overwhelmed by life's changes.",
            keywords: ["Emotional Peace", "Universal Compassion", "Intuition", "Nurturing", "Calm Mind"]
        },
        "Mars": {
            title: "Soul of Courage & Righteous Action",
            summary: "Mars as Atmakaraka indicates a powerful soul born for decisive, courageous action. The primary karmic test is controlling anger, passion, and impatience, practicing Ahimsa (non-injury in word and deed), and dedicating your formidable drive to protecting others.",
            keywords: ["Righteous Courage", "Self-Discipline", "Ahimsa", "Determination", "Protection"]
        },
        "Mercury": {
            title: "Soul of Truth & Intellectual Wisdom",
            summary: "Mercury as Atmakaraka indicates a soul gifted with razor-sharp analytical intelligence. Your core spiritual lesson is practicing truthful and mindful communication (Satya), avoiding deceit, and utilizing your intellect to uncover sacred truth.",
            keywords: ["Truthful Speech", "Intellectual Wisdom", "Mindfulness", "Clear Discernment"]
        },
        "Jupiter": {
            title: "Soul of Higher Dharma & Divine Grace",
            summary: "Jupiter as Atmakaraka indicates a highly evolved, spiritually benevolent soul. Your path involves honoring spiritual teachers and elders, imparting divine wisdom without dogma or judgment, and walking the path of unconditional righteousness.",
            keywords: ["Spiritual Dharma", "Sacred Wisdom", "Generosity", "Mentorship", "Grace"]
        },
        "Venus": {
            title: "Soul of Pure Devotion & Sensory Mastery",
            summary: "Venus as Atmakaraka indicates an aesthetically gifted soul deeply connected to beauty and love. The core karmic lesson is self-restraint—mastering sensory desires, practicing marital fidelity, and elevating romantic love into divine devotion (Bhakti).",
            keywords: ["Divine Devotion", "Sensory Control", "Purity", "Artistic Grace", "Harmony"]
        },
        "Saturn": {
            title: "Soul of Endurance & Karma Yoga",
            summary: "Saturn as Atmakaraka indicates an ancient, resilient soul chosen for deep spiritual realization through perseverance. Your path is Karma Yoga—patiently serving humanity, embracing simplicity, and finding supreme liberation through selfless duty.",
            keywords: ["Karma Yoga", "Patience & Duty", "Selfless Service", "Humility", "Endurance"]
        }
    },
    AmK: {
        "Sun": {
            title: "Executive Leader & Public Administrator",
            summary: "With Sun as Amatyakaraka, your worldly career flourishes in government administration, top-tier executive leadership, entrepreneurship, and authoritative management. You are destined to hold responsibility and steer organizations with visionary resolve.",
            keywords: ["Governance", "Executive Leadership", "Entrepreneurship", "Public Eminence"]
        },
        "Moon": {
            title: "Humanitarian, Creative & Public Relations Maven",
            summary: "With Moon as Amatyakaraka, your career thrives through public outreach, psychology, healthcare, hospitality, creative media, and counseling. Your instinctive emotional intelligence and grasp of human sentiment make you universally relatable.",
            keywords: ["Public Relations", "Creative Arts", "Healthcare", "Counseling", "Human Touch"]
        },
        "Mars": {
            title: "Technical Innovator, Engineer & Strategic Executive",
            summary: "With Mars as Amatyakaraka, your professional path succeeds in engineering, technology, defense, surgery, real estate, and fast-paced project leadership. You excel where bold decisive execution and competitive courage are paramount.",
            keywords: ["Engineering & Tech", "Operations", "Dynamic Execution", "Real Estate & Defense"]
        },
        "Mercury": {
            title: "Financial Strategist, Media & Tech Specialist",
            summary: "With Mercury as Amatyakaraka, your career excels in finance, corporate commerce, software, media, communication, analytics, and journalism. Your verbal agility and strategic calculation open remarkable professional avenues.",
            keywords: ["Commerce & Finance", "Data & Software", "Journalism & Media", "Advisory"]
        },
        "Jupiter": {
            title: "Chief Advisor, Legal & Financial Counselor",
            summary: "With Jupiter as Amatyakaraka, your career reaches its highest potential in corporate advisory, law, wealth consulting, higher education, and mentorship. Your ethical judgment and farsighted perspective attract deep institutional trust.",
            keywords: ["Corporate Advisory", "Legal Counsel", "Wealth Management", "Higher Education"]
        },
        "Venus": {
            title: "Creative Director, Luxury & Diplomatic Strategist",
            summary: "With Venus as Amatyakaraka, your career mission blossoms through creative arts, design, luxury branding, diplomacy, finance, entertainment, and public diplomacy. You excel at building prestigious alliances and elevating aesthetics.",
            keywords: ["Creative Design", "Diplomacy & PR", "Luxury & Brand", "Finance & Partnerships"]
        },
        "Saturn": {
            title: "Master Builder, Industry & Structural Strategist",
            summary: "With Saturn as Amatyakaraka, your professional destiny is forged through enduring discipline in industry, manufacturing, infrastructure, institutional governance, and long-range development. Your success compounds steadily through diligence.",
            keywords: ["Industrial Leadership", "Infrastructure", "Operations", "Long-term Planning"]
        }
    },
    DK: {
        "Sun": {
            title: "Dignified, Self-Respecting & Noble Partner",
            summary: "Sun as Darakaraka signifies a spouse with an inspiring presence, strong self-esteem, and natural leadership dignity. Your partner holds high ethical standards, carries an authoritative aura, and inspires you to live with royal integrity.",
            keywords: ["Noble Presence", "Self-Respect", "Integrity", "Leadership Dignity"]
        },
        "Moon": {
            title: "Gentle, Nurturing & Intuitive Soul Companion",
            summary: "Moon as Darakaraka signifies a tender, deeply affectionate, and emotionally supportive life partner. Your spouse cherishes home sanctuary, emotional bonding, and provides a soothing, deeply understanding presence in your life.",
            keywords: ["Deep Affection", "Home Sanctuary", "Intuitive Care", "Emotional Support"]
        },
        "Mars": {
            title: "Dynamic, Passionate & Fiercely Loyal Partner",
            summary: "Mars as Darakaraka signifies an energetic, ambitious, bold, and fiercely protective spouse. Your partner brings fiery passion, athletic vitality, and unwavering defense to your marriage, spurring active mutual accomplishment.",
            keywords: ["Fierce Loyalty", "Vital Energy", "Protective Passion", "Bold Courage"]
        },
        "Mercury": {
            title: "Witty, Youthful & Intellectually Engaging Partner",
            summary: "Mercury as Darakaraka signifies a spouse who is intellectually sharp, humorous, articulate, and youthful at heart. Your marriage is anchored in sparkling conversations, shared laughter, curiosity, and continuous intellectual companionship.",
            keywords: ["Intellectual Bond", "Humor & Wit", "Youthful Spirit", "Great Communicator"]
        },
        "Jupiter": {
            title: "Wise, Spiritual & Auspicious Guide",
            summary: "Jupiter as Darakaraka signifies a wise, virtuous, and spiritually minded spouse who acts as a trusted mentor and divine blessing. Your partnership brings spiritual elevation, profound mutual honor, and enduring prosperity.",
            keywords: ["Spiritual Wisdom", "Dharma & Virtue", "Guiding Presence", "Enduring Prosperity"]
        },
        "Venus": {
            title: "Charming, Romantic & Artistically Refined Partner",
            summary: "Venus as Darakaraka signifies an exceptionally attractive, artistic, loving, and refined life partner. Your union is characterized by romantic warmth, aesthetic harmony, joyful companionship, and deep emotional sweetness.",
            keywords: ["Romance & Charm", "Aesthetic Elegance", "Loving Tenderness", "Harmonious Union"]
        },
        "Saturn": {
            title: "Grounded, Mature & Unshakably Faithful Partner",
            summary: "Saturn as Darakaraka signifies a mature, dependable, practical, and profoundly faithful life companion. Your spouse brings stability, enduring patience, and unconditional loyalty, anchoring your life through every circumstance.",
            keywords: ["Steadfast Loyalty", "Grounded Maturity", "Patience", "Enduring Foundation"]
        }
    }
};

const YOGINI_DETAILS = {
    "Mangala": {
        nature: "Supreme Benefic (Shubha)",
        deity: "Goddess Mangala (Durga)",
        theme: "Auspicious Celebrations, Peace of Mind & Prosperity",
        coreMeaning: "Mangala is ruled by the Moon and brings auspicious ceremonies, inner mental peace, and family happiness. Obstacles diminish, spiritual interests blossom, and health and reputation flourish.",
        effects: [
            "Auspicious ceremonies, marriages, or family celebrations",
            "Inner mental peace and relief from emotional anxiety",
            "Spiritual inclination and divine protection",
            "Favorable recognition from peers and elders"
        ],
        remedies: "Worship Goddess Durga or Parvati, chant 'Om Dum Durgayei Namaha', offer white flowers or milk sweets on Mondays."
    },
    "Pingala": {
        nature: "Challenging & Transformative (Pitta / Agni)",
        deity: "Goddess Pingala (Surya Shakti)",
        theme: "Vitality Trials, Leadership Tests & High Energy",
        coreMeaning: "Pingala is ruled by the Sun and tests endurance, physical vitality, and patience. While it can cause heat, restlessness, or friction with authority, it grants tremendous determination and leadership victory when guided constructively.",
        effects: [
            "High ambition and strong drive to conquer challenges",
            "Tests of ego, patience, and authority relations",
            "Health watch: manage stress, acidity, and physical fatigue",
            "Eventual triumph over adversaries through willpower"
        ],
        remedies: "Recite Aditya Hridaya Stotram or Gayatri Mantra, offer water (Arghya) to Lord Surya at sunrise, donate jaggery or wheat on Sundays."
    },
    "Dhanya": {
        nature: "Abundant Benefic (Dhana & Vriddhi)",
        deity: "Goddess Dhanya (Lakshmi / Annapurna)",
        theme: "Financial Abundance, Educational Honors & Divine Grace",
        coreMeaning: "Dhanya is ruled by Jupiter and signifies a rich golden harvest in life. Wealth accumulates steadily, intellectual wisdom expands, virtuous mentors appear, and long-standing ambitions reach fruition.",
        effects: [
            "Steady rise in income, savings, and assets",
            "Academic or professional honors and career elevation",
            "Blessings from spiritual mentors and family elders",
            "Birth of children or joyful family milestones"
        ],
        remedies: "Worship Lord Vishnu and Goddess Annapurna, chant 'Om Namo Bhagavate Vasudevaya', feed cows, donate yellow lentils or books on Thursdays."
    },
    "Bhramari": {
        nature: "Turbulent & Restless (Chala / Motion)",
        deity: "Goddess Bhramari (The Sacred Bee Goddess)",
        theme: "Travel, Relocation, Dynamic Changes & Resilience",
        coreMeaning: "Bhramari is ruled by Mars and brings wanderlust, rapid changes, travels, or relocations. It creates high physical energy and ambition, but requires discipline to avoid hasty decisions or scattered expenses.",
        effects: [
            "Frequent journeys, relocations, or foreign exploration",
            "Fluctuating fortunes requiring careful financial budgeting",
            "High stamina and courage to face unfamiliar environments",
            "Dynamic personal transformation through new experiences"
        ],
        remedies: "Recite Hanuman Chalisa, worship Lord Kartikeya, practice patience before big moves, donate red lentils on Tuesdays."
    },
    "Bhadrika": {
        nature: "Deeply Auspicious & Protective (Kalyana)",
        deity: "Goddess Bhadrika (Bhadrakali / Saraswati)",
        theme: "Career Advancement, Sharp Intellect & Faithful Friends",
        coreMeaning: "Bhadrika is ruled by Mercury and represents auspicious welfare and refined intelligence. Career status ascends, commercial ventures succeed, and true friends provide crucial support.",
        effects: [
            "Rapid career advancement, promotions, and status rise",
            "Intellectual clarity, successful examinations, and business wins",
            "Strengthening of helpful friendships and professional networks",
            "Domestic happiness and sound health recovery"
        ],
        remedies: "Worship Goddess Saraswati and Lord Ganesha, chant 'Om Gam Ganapataye Namaha', feed green vegetables to cows on Wednesdays."
    },
    "Ulka": {
        nature: "Karmic Purification & Discipline (Tapas)",
        deity: "Goddess Ulka (Chandi)",
        theme: "Patience, Hard Labor, Karmic Clearance & Inner Strength",
        coreMeaning: "Ulka is ruled by Saturn and acts like a fiery cleansing meteor burning off past karma. It requires hard work, patience, and humility. Those who stay steady emerge with permanent inner resilience and wisdom.",
        effects: [
            "Heavy workloads requiring persistent, uncomplaining effort",
            "Delays in long-term goals that test your endurance",
            "Health watch: care for joints, bones, teeth, and fatigue",
            "Profound spiritual maturation and karmic liberation"
        ],
        remedies: "Recite Hanuman Chalisa or Shani Stotram, light a mustard oil lamp under a Peepal tree on Saturday evenings, serve the elderly and disadvantaged."
    },
    "Siddha": {
        nature: "Crown Jewel of Yogini (Sarva Siddhi / Supreme Fulfillment)",
        deity: "Goddess Siddha (Maha Lakshmi / Tripurasundari)",
        theme: "Total Success, Desires Fulfilled, Wealth, Romance & Renown",
        coreMeaning: "Siddha is ruled by Venus and is regarded as the most prosperous and joyful period in Yogini Dasha. Noble endeavors succeed effortlessly, wealth and luxuries arrive, romance blossoms, and heartfelt aspirations are fulfilled.",
        effects: [
            "Material prosperity, acquisition of vehicles, jewelry, and luxury",
            "Marital bliss, romantic fulfillment, and high social charm",
            "Artistic, creative, and professional public acclaim",
            "Effortless fulfillment of long-cherished dreams (Siddhi)"
        ],
        remedies: "Worship Goddess Maha Lakshmi and Lalita Tripurasundari, chant 'Om Shreem Mahalakshmiyei Namaha', wear clean light/pastel clothing on Fridays, respect women and donate sweets."
    },
    "Sankata": {
        nature: "Crucial Karmic Crucible & Deep Awakening",
        deity: "Goddess Sankata (Vankal Mata / Maha Kali)",
        theme: "Unpredictable Shifts, Attachment Release & Spiritual Power",
        coreMeaning: "Sankata is the longest Yogini period (8 years) ruled by Rahu. It brings unexpected plot twists, shifts in lifestyle, and tests that shatter false illusions. Through spiritual surrender and faith, it transforms into an impenetrable shield of divine grace.",
        effects: [
            "Sudden changes in surroundings, career direction, or relationships",
            "Mental turbulence pushing you toward deeper spiritual inquiry",
            "Awakening of intuition and profound occult or philosophical insight",
            "Immense spiritual strength discovered after weathering storms"
        ],
        remedies: "Worship Goddess Durga or Maha Kali, recite Durga Chalisa, feed stray dogs on Saturdays, perform Rahu charitable donations (coconut, black sesame)."
    }
};

const NAKSHATRA_DATA = {
    "Ashwini": { lord: "Ketu", deity: "Ashwini Kumaras (Divine Healers)", symbol: "Horse's Head", gana: "Deva", element: "Earth", animal: "Male Horse", traits: "Swift, adventurous, pioneering, possessing healing natural vitality and spontaneous action." },
    "Bharani": { lord: "Venus", deity: "Yama (Lord of Dharma & Justice)", symbol: "Yoni / Sacred Triangle", gana: "Manushya", element: "Earth", animal: "Elephant", traits: "Passionate, courageous, enduring, navigating profound life transformations with inner strength." },
    "Krittika": { lord: "Sun", deity: "Agni (God of Sacred Fire)", symbol: "Razor / Sharp Flame", gana: "Rakshasa", element: "Fire", animal: "Female Sheep", traits: "Fierce, pure, sharp intellect, natural critic, and protective guardian of eternal truth." },
    "Rohini": { lord: "Moon", deity: "Brahma (The Creator)", symbol: "Ox Cart / Temple Chariot", gana: "Manushya", element: "Earth", animal: "Serpent", traits: "Charming, artistic, romantic, magnetic charisma, creative imagination, and sensual grace." },
    "Mrigashira": { lord: "Mars", deity: "Soma (Chandra / Divine Nectar)", symbol: "Deer's Head", gana: "Deva", element: "Earth", animal: "Female Serpent", traits: "Curious, searching, gentle, deeply insightful seeker of truth, traveling and learning." },
    "Ardra": { lord: "Rahu", deity: "Rudra (Storm & Transformation)", symbol: "Teardrop / Diamond", gana: "Manushya", element: "Water", animal: "Female Dog", traits: "Transformative, emotionally deep, resilient after life storms, intellectual breakthroughs." },
    "Punarvasu": { lord: "Jupiter", deity: "Aditi (Cosmic Mother of Gods)", symbol: "Bow & Quiver of Arrows", gana: "Deva", element: "Water", animal: "Female Cat", traits: "Virtuous, forgiving, resilient, home-loving, symbolizing the eternal return of light." },
    "Pushya": { lord: "Saturn", deity: "Brihaspati (Guru of the Gods)", symbol: "Cow's Udder / Lotus Blossom", gana: "Deva", element: "Water", animal: "Male Sheep", traits: "Supreme spiritual nourishment, deeply auspicious, kind benefactor, wisdom and patience." },
    "Ashlesha": { lord: "Mercury", deity: "Sarpas (Nagas / Divine Serpents)", symbol: "Coiled Serpent", gana: "Rakshasa", element: "Water", animal: "Male Cat", traits: "Intuitive, hypnotic, protective, mystical intellect, sharp instincts, and esoteric understanding." },
    "Magha": { lord: "Ketu", deity: "Pitrus (Ancestral Forefathers)", symbol: "Royal Throne / Palanquin", gana: "Rakshasa", element: "Water", animal: "Male Rat", traits: "Regal presence, natural born leader, authority, deeply guided and blessed by ancestral lineage." },
    "Purva Phalguni": { lord: "Venus", deity: "Bhaga (God of Fortune & Prosperity)", symbol: "Hammock / Front Legs of Bed", gana: "Manushya", element: "Water", animal: "Female Rat", traits: "Sociable, charismatic, affectionate, blessed with fortune, romance, artistic taste, and relaxation." },
    "Uttara Phalguni": { lord: "Sun", deity: "Aryaman (God of Patronage & Truth)", symbol: "Back Legs of Bed", gana: "Manushya", element: "Fire", animal: "Male Bull", traits: "Honorable, dependable ally, charitable, steadfast integrity, upholding righteous duty." },
    "Hasta": { lord: "Moon", deity: "Savitar (Creative Sun God)", symbol: "Hand / Open Palm", gana: "Deva", element: "Fire", animal: "Female Buffalo", traits: "Dexterous hands, healing touch, craftsmanship, clever wit, and manifesting ideas into reality." },
    "Chitra": { lord: "Mars", deity: "Vishwakarma (Celestial Architect)", symbol: "Bright Pearl / Brilliant Jewel", gana: "Rakshasa", element: "Fire", animal: "Female Tiger", traits: "Visual beauty, architectural genius, charismatic elegance, flair for art, style, and creation." },
    "Swati": { lord: "Rahu", deity: "Vayu (Wind God)", symbol: "Young Shoot / Coral", gana: "Deva", element: "Fire", animal: "Male Buffalo", traits: "Independent, adaptable, skilled communicator, gentle breeze of compassion, and business acumen." },
    "Vishakha": { lord: "Jupiter", deity: "Indra & Agni (Alliance of Power)", symbol: "Triumphal Arch / Potter's Wheel", gana: "Rakshasa", element: "Fire", animal: "Male Tiger", traits: "Fiercely focused, goal-driven, victorious in long endeavors through determination and courage." },
    "Anuradha": { lord: "Saturn", deity: "Mitra (God of Divine Friendship)", symbol: "Lotus Flower / Furrows", gana: "Deva", element: "Fire", animal: "Female Deer", traits: "Loyal, organizational genius, devoted seeker, blossoming with beauty even amidst adversity." },
    "Jyeshtha": { lord: "Mercury", deity: "Indra (King of the Gods)", symbol: "Circular Amulet / Royal Umbrella", gana: "Rakshasa", element: "Air", animal: "Male Deer", traits: "Eldership, protective warrior courage, managing crisis with sharp intellect and resolve." },
    "Mula": { lord: "Ketu", deity: "Nirriti (Goddess of Dissolution)", symbol: "Tied Bunch of Roots", gana: "Rakshasa", element: "Air", animal: "Male Dog", traits: "Deep root-investigation, philosophical truth, piercing illusions to uncover foundational reality." },
    "Purva Ashadha": { lord: "Venus", deity: "Apas (Sacred Cosmic Waters)", symbol: "Elephant Tusk / Winnowing Fan", gana: "Manushya", element: "Air", animal: "Male Monkey", traits: "Invincible, persuasive orator, purifying presence, spreading optimism, victory, and joy." },
    "Uttara Ashadha": { lord: "Sun", deity: "Vishvadevas (Universal Divine Gods)", symbol: "Planks of Bed / Elephant Tusk", gana: "Manushya", element: "Air", animal: "Male Mongoose", traits: "Unshakable integrity, permanent triumph, ethical duty, and leadership dedicated to the collective good." },
    "Shravana": { lord: "Moon", deity: "Vishnu (The Preserver & Protector)", symbol: "Ear / Three Footsteps", gana: "Deva", element: "Air", animal: "Female Monkey", traits: "Profound listener, scholarly mind, learning through oral traditions, and universal wisdom." },
    "Dhanishta": { lord: "Mars", deity: "Ashta Vasus (8 Elemental Gods of Wealth)", symbol: "Mridanga Drum / Flute", gana: "Rakshasa", element: "Ether", animal: "Female Lion", traits: "Innate rhythm, musical ear, material wealth, prominence, high energy, and performing vitality." },
    "Shatabhisha": { lord: "Rahu", deity: "Varuna (Lord of Cosmic Waters & Truth)", symbol: "Empty Circle / 100 Healers", gana: "Rakshasa", element: "Ether", animal: "Female Horse", traits: "Mystical healer of 100 cures, meditative, philosophical, keeping deep spiritual secrets." },
    "Purva Bhadrapada": { lord: "Jupiter", deity: "Aja Ekapada (Fire of Cosmic Lightning)", symbol: "Sword / Front Legs of Cot", gana: "Manushya", element: "Ether", animal: "Male Lion", traits: "Visionary, intense tapas, spiritual reformer, unwavering conviction, and fiery enthusiasm." },
    "Uttara Bhadrapada": { lord: "Saturn", deity: "Ahirbudhnya (Serpent of Ocean Depths)", symbol: "Back Legs of Cot / Deep Sea Serpent", gana: "Manushya", element: "Ether", animal: "Female Cow", traits: "Deep meditation, patient, calm under storm, grounded wisdom, and benevolent counseling." },
    "Revati": { lord: "Mercury", deity: "Pushan (Nourisher & Protector of Flocks)", symbol: "Pair of Fish / Small Drum", gana: "Deva", element: "Ether", animal: "Female Elephant", traits: "Compassionate, gentle guide, prosperous, blessed with ultimate spiritual grace and completion." }
};

const NORMALIZE_MAP = {
    "dasha": "dasha-periods",
    "transit": "gochar",
    "moon-sign-calculator": "moon-sign",
    "sun-sign-calculator": "sun-sign",
    "nakshatra-calculator": "nakshatra",
    "ascendant-calculator": "ascendant",
    "numerology-calculator": "numerology",
    "friendship-calculator": "friendship",
    "marriage-&-career": "marriage-career",
    "today-hora-muhurat": "hora-muhurat",
    "today-choghadiya-muhurat": "choghadiya",
    "compatability": "zodiac-compatibility"
};

const CALCULATOR_METAS = {
    "ashtakavarga": {
        title: "Ashtakavarga Strength",
        subtitle: "Bhinnashtakavarga & SAV Points",
        desc: "Analyzes cosmic planetary strength and benefic bindus across all 12 astrological signs.",
        icon: Star,
        color: "text-amber-300"
    },
    "dasha-periods": {
        title: "Vimshottari Dasha Periods",
        subtitle: "120-Year Planetary Ruling Cycles",
        desc: "Unveil your 120-year Vimshottari Mahadasha timeline, Antardashas, and current planetary ruler.",
        icon: Clock,
        color: "text-indigo-300"
    },
    "yogini-dasha": {
        title: "Yogini Dasha Calculator",
        subtitle: "36-Year Tantric Cycle",
        desc: "Discover your current ruling Yogini among the 8 sacred deities governing life events.",
        icon: Sparkles,
        color: "text-purple-300"
    },
    "atmakaraka": {
        title: "Atmakaraka (Soul Planet)",
        subtitle: "Jaimini 7 Karakas Analysis",
        desc: "Identifies your Atmakaraka (Soul planet), Amatyakaraka (Career), and Jaimini life indicators.",
        icon: Star,
        color: "text-amber-300"
    },
    "gochar": {
        title: "Live Planetary Transits (Gochar)",
        subtitle: "Real-Time Celestial Positions",
        desc: "Current live positions and signs of all 9 astrological planets relative to current space and time.",
        icon: Activity,
        color: "text-rose-300"
    },
    "moon-sign": {
        title: "Moon Sign (Rashi) Calculator",
        subtitle: "Vedic Chandra Rashi",
        desc: "Calculates your exact Vedic Moon Sign, emotional nature, birth Nakshatra, and ruling deity.",
        icon: Moon,
        color: "text-purple-300"
    },
    "sun-sign": {
        title: "Sun Sign Calculator",
        subtitle: "Solar Zodiac Identity",
        desc: "Find your true Sun sign, core life vitality, soul ambition, and astrological elemental alignment.",
        icon: Sun,
        color: "text-amber-300"
    },
    "nakshatra": {
        title: "Nakshatra (Birth Star) Finder",
        subtitle: "27 Lunar Mansions",
        desc: "Discover your birth star, Pada, ruling planet, deity, Gana (nature), and spiritual essence.",
        icon: Star,
        color: "text-amber-300"
    },
    "ascendant": {
        title: "Ascendant (Lagna) Calculator",
        subtitle: "Rising Sign & Physical Aura",
        desc: "Computes the exact eastern rising sign at birth, physical attributes, vitality, and life path.",
        icon: Moon,
        color: "text-orange-300"
    },
    "numerology": {
        title: "Numerology Guide",
        subtitle: "Life Path & Destiny Numbers",
        desc: "Calculates your Life Path Number, Destiny Number, and Soul Urge Number from your name and birth date.",
        icon: Hash,
        color: "text-emerald-300"
    },
    "friendship": {
        title: "Friendship Compatibility",
        subtitle: "Vedic Bond Analysis",
        desc: "Analyze the energetic harmony, loyalty, and communication synergy between you and a friend.",
        icon: Heart,
        color: "text-blue-300"
    },
    "marriage-career": {
        title: "Marriage & Career Timing",
        subtitle: "Dasha & Transit Windows",
        desc: "Identifies the most auspicious upcoming astrological windows for marriage and professional success.",
        icon: Briefcase,
        color: "text-rose-300"
    },
    "hora-muhurat": {
        title: "Hora Muhurat",
        subtitle: "24 Hourly Planetary Rulers",
        desc: "View the auspicious and inauspicious Hora hours of the day governed by the 7 classical planets.",
        icon: Sparkles,
        color: "text-amber-300"
    },
    "choghadiya": {
        title: "Choghadiya Muhurat",
        subtitle: "Shubh, Labh & Amrit Timings",
        desc: "Day and Night Choghadiya timings for selecting auspicious moments for work, travel, and ventures.",
        icon: Sparkles,
        color: "text-emerald-300"
    },
    "zodiac-compatibility": {
        title: "Zodiac Sign Compatibility",
        subtitle: "Elemental & Astrological Harmony",
        desc: "Compare any two zodiac signs across emotional bonding, communication, trust, and relationship longevity.",
        icon: Sun,
        color: "text-orange-300"
    }
};

const HORA_PLANET_INFO = {
    Sun: { desc: "Ideal for leadership, government dealings, applying for jobs & authority.", auspicious: "Good", color: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
    Moon: { desc: "Best for creative ventures, travel, meeting family, emotional harmony.", auspicious: "Good", color: "text-purple-300 bg-purple-400/10 border-purple-400/30" },
    Mars: { desc: "Favorable for sports, physical tasks, surgery, property. Avoid arguments.", auspicious: "Neutral", color: "text-rose-300 bg-rose-400/10 border-rose-400/30" },
    Mercury: { desc: "Excellent for business, trade, writing, banking, studies & negotiations.", auspicious: "Very Good", color: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30" },
    Jupiter: { desc: "Most auspicious! Perfect for weddings, financial investments, spiritual pujas.", auspicious: "Excellent", color: "text-amber-300 bg-amber-400/15 border-amber-400/40" },
    Venus: { desc: "Favorable for love, arts, luxury purchases, vehicle buy, beauty & outings.", auspicious: "Very Good", color: "text-pink-300 bg-pink-400/10 border-pink-400/30" },
    Saturn: { desc: "Suited for hard labor, persistence, meditation. Avoid starting new ventures.", auspicious: "Caution", color: "text-blue-300 bg-blue-400/10 border-blue-400/30" }
};

const CHOGHADIYA_INFO = {
    Amrit: { desc: "Supreme nectar. Most auspicious for all types of work & celebrations.", type: "Auspicious", color: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30" },
    Shubh: { desc: "Good & auspicious. Best for religious ceremonies, education, weddings.", type: "Auspicious", color: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30" },
    Labh: { desc: "Profitable & beneficial. Highly favorable for business, money, trade.", type: "Auspicious", color: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30" },
    Char: { desc: "Dynamic & moving. Favorable for travel, dynamic tasks & journeys.", type: "Neutral", color: "text-cyan-300 bg-cyan-500/15 border-cyan-400/30" },
    Rog: { desc: "Harmful / illness. Avoid starting new businesses or medical therapies.", type: "Inauspicious", color: "text-rose-300 bg-rose-500/15 border-rose-400/30" },
    Kaal: { desc: "Adverse / time of Saturn. Delay important work, avoid risks & disputes.", type: "Inauspicious", color: "text-rose-300 bg-rose-500/15 border-rose-400/30" },
    Udveg: { desc: "Anxiety & restlessness. Avoid government work or stressful meetings.", type: "Inauspicious", color: "text-amber-300 bg-amber-500/15 border-amber-400/30" }
};

// Robust helper to get local date and clock time (GUARANTEES 100% MATCH WITH LOCAL TIME & WEB)
const getLocalFormattedDateTime = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return {
        dateStr: `${year}-${month}-${day}`,
        timeStr: `${hours}:${minutes}`
    };
};

// Precise Time Parser for Choghadiya & Hora Slot Detection (Matching Web Logic)
const parseMuhuratTime = (str, referenceDate = new Date()) => {
    if (!str) return null;
    const parts = str.trim().split(' ');
    if (parts.length < 2) return null;
    const [time, modifier] = parts;
    const [hoursStr, minutesStr, secondsStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr, 10) || 0;
    if (hours === 12) hours = 0;
    if (modifier?.toUpperCase() === 'PM') hours += 12;
    const d = new Date(referenceDate);
    d.setHours(hours, minutes, seconds, 0);
    return d;
};

// Check if selected date is today
const isMuhuratToday = (dateStr) => {
    if (!dateStr) return true;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const selYear = parseInt(parts[0], 10);
        const selMonth = parseInt(parts[1], 10) - 1;
        const selDay = parseInt(parts[2], 10);
        const today = new Date();
        return selDay === today.getDate() &&
               selMonth === today.getMonth() &&
               selYear === today.getFullYear();
    }
    const sel = new Date(dateStr);
    const today = new Date();
    return sel.getDate() === today.getDate() &&
           sel.getMonth() === today.getMonth() &&
           sel.getFullYear() === today.getFullYear();
};

// Check if a specific slot is running at this exact second
const isCurrentMuhuratSlot = (startStr, endStr, dateStr) => {
    if (!isMuhuratToday(dateStr)) return false;
    const now = new Date();
    try {
        let start = parseMuhuratTime(startStr, now);
        let end = parseMuhuratTime(endStr, now);
        if (!start || !end) return false;

        // If end is earlier than start, the slot crosses midnight (e.g. 11 PM to 1 AM or 12:08 AM)
        if (end < start) {
            if (now < start) {
                const yesterdayStart = new Date(start);
                yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                return now >= yesterdayStart && now < end;
            } else {
                const tomorrowEnd = new Date(end);
                tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
                return now >= start && now < tomorrowEnd;
            }
        }
        return now >= start && now < end;
    } catch {
        return false;
    }
};

export default function CalculatorClient({ type: propType }) {
    const rawType = propType || "ashtakavarga";
    const type = NORMALIZE_MAP[rawType] || rawType;
    const meta = CALCULATOR_METAS[type] || CALCULATOR_METAS["ashtakavarga"];

    const router = useRouter();
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState("day"); // For Hora / Choghadiya (day vs night)
    const [selectedYogini, setSelectedYogini] = useState(null); // For Yogini Dasha period summary popup
    const [timingTab, setTimingTab] = useState("marriage"); // For Marriage & Career timing ("marriage" vs "career")
    const [showAllTimings, setShowAllTimings] = useState(false); // Toggle to show more/all favorable windows

    // Dedicated state for Live Gochar (No birth form, works like web)
    const [gocharViewMode, setGocharViewMode] = useState("cosmos"); // 'cosmos', 'chart', or 'table'
    const [chartStyle, setChartStyle] = useState("north"); // 'north' or 'south'
    const [gocharLocation, setGocharLocation] = useState({
        place: "New Delhi, India",
        lat: 28.6139,
        lng: 77.2090,
        timezone: 5.5
    });

    // Dedicated state for Choghadiya & Hora Muhurats (No birth form, works like web!)
    const [muhuratDate, setMuhuratDate] = useState(() => getLocalFormattedDateTime().dateStr);
    const [muhuratLocation, setMuhuratLocation] = useState({
        place: "New Delhi, India",
        lat: 28.6139,
        lng: 77.2090,
        timezone: "Asia/Kolkata"
    });

    // Form inputs for standard birth chart calculators
    const [formData, setFormData] = useState({
        name: "",
        gender: "male",
        date: "",
        time: "",
        place: "",
        lat: null,
        lng: null,
        timezone: 5.5,
        partnerName: "",
        sign1: "Aries",
        sign2: "Leo"
    });

    // Pre-fill from user birth details
    useEffect(() => {
        if (isInitialized && birthDetails) {
            setFormData(prev => ({
                ...prev,
                name: birthDetails.name || "",
                gender: birthDetails.gender || "male",
                date: birthDetails.date || "",
                time: birthDetails.time || "",
                place: birthDetails.place || "",
                lat: birthDetails.lat || null,
                lng: birthDetails.lng || null,
                timezone: birthDetails.timezone || 5.5
            }));

            if (birthDetails.lat && birthDetails.lng && birthDetails.place) {
                setMuhuratLocation({
                    place: birthDetails.place,
                    lat: birthDetails.lat,
                    lng: birthDetails.lng,
                    timezone: (typeof birthDetails.timezone === 'string' && birthDetails.timezone.includes('/')) ? birthDetails.timezone : "Asia/Kolkata"
                });
            }
        }
    }, [isInitialized, birthDetails]);

    // Reset scroll to top on mount and whenever result or type changes
    useEffect(() => {
        const scrollToTop = () => {
            const container = document.getElementById("main-scroll-container");
            if (container) {
                container.scrollTop = 0;
            }
            window.scrollTo(0, 0);
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
        };

        scrollToTop();
        const rAF = requestAnimationFrame(scrollToTop);
        const timer = setTimeout(scrollToTop, 60);

        return () => {
            cancelAnimationFrame(rAF);
            clearTimeout(timer);
        };
    }, [result, type]);

    // Handle Sade Sati redirect if user navigated here with sade-sati-calculator
    useEffect(() => {
        if (rawType === "sade-sati-calculator") {
            router.replace("/dosha?type=sadesati");
        }
    }, [rawType, router]);

    // Automatically load Live Gochar immediately without birth form (Just like on Web!)
    useEffect(() => {
        if (type === "gochar") {
            fetchLiveGochar();
        } else if (type === "hora-muhurat" || type === "choghadiya") {
            fetchMuhuratData();
        }
    }, [type, muhuratDate]);

    // Automatically select Day or Night tab based on current time & astronomical sunrise/sunset
    useEffect(() => {
        if ((type === "choghadiya" || type === "hora-muhurat") && result?.sun?.sunrise && result?.sun?.sunset) {
            const now = new Date();
            const sr = parseMuhuratTime(result.sun.sunrise, now);
            const ss = parseMuhuratTime(result.sun.sunset, now);
            if (sr && ss) {
                const isDay = now >= sr && now < ss;
                setActiveTab(isDay ? "day" : "night");
            }
        }
    }, [type, result?.sun]);

    // Gochar fetch using local calendar date & local clock time (FIXES UTC MISMATCH)
    const fetchLiveGochar = async (customLoc) => {
        setLoading(true);
        try {
            const { dateStr, timeStr } = getLocalFormattedDateTime();
            const targetLoc = customLoc || gocharLocation;

            const res = await api.post("/astro/kundli", {
                date: dateStr,
                time: timeStr,
                lat: targetLoc.lat,
                lng: targetLoc.lng,
                timezone: typeof targetLoc.timezone === 'number' ? targetLoc.timezone : 5.5,
                name: "Current Transit",
                gender: "male"
            });

            if (res.data?.success) {
                setResult(res.data.data);
            } else {
                toast.error("Failed to load real-time planetary positions.");
            }
        } catch (err) {
            console.error("Live Gochar Fetch Error:", err);
            toast.error("Failed to load live transit data.");
        } finally {
            setLoading(false);
        }
    };

    const handleGocharLocationSelect = (loc) => {
        const newLoc = {
            place: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng,
            timezone: 5.5
        };
        setGocharLocation(newLoc);
        fetchLiveGochar(newLoc);
        toast.success(`Updated Gochar for ${newLoc.place.split(',')[0]}`);
    };

    // Dedicated Muhurat fetch for Choghadiya & Hora (NO BIRTH FORM, PROPER IANA TIMEZONE)
    const fetchMuhuratData = async (customLoc) => {
        setLoading(true);
        try {
            const targetLoc = customLoc || muhuratLocation;
            const res = await api.post("/panchang/calculate", {
                date: muhuratDate,
                lat: targetLoc.lat || 28.6139,
                lng: targetLoc.lng || 77.2090,
                timezone: "Asia/Kolkata"
            });

            if (res.data?.success && res.data?.data?.panchang) {
                setResult(res.data.data.panchang);
            } else {
                toast.error("Failed to load muhurat timings.");
            }
        } catch (err) {
            console.error("Fetch Muhurat Error:", err);
            toast.error("Unable to load muhurat data.");
        } finally {
            setLoading(false);
        }
    };

    const handleMuhuratLocationSelect = (loc) => {
        const newLoc = {
            place: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng,
            timezone: "Asia/Kolkata"
        };
        setMuhuratLocation(newLoc);
        fetchMuhuratData(newLoc);
        toast.success(`Updated Muhurat for ${newLoc.place.split(',')[0]}`);
    };

    const handleLocationSelect = (details) => {
        setFormData(prev => ({
            ...prev,
            place: details.formattedAddress,
            lat: details.lat,
            lng: details.lng,
            timezone: details.timezone || 5.5
        }));
    };

    const handleShareMoonSign = async () => {
        if (!result) return;
        const sign = result.moonSignName || (result.planets?.Moon?.sign ? SIGNS[result.planets.Moon.sign - 1] : "Moon");
        const star = result.nakshatraName || result.dashas?.birthNakshatra || "-";
        const moonDeg = result.moonDeg || ((result.planets?.Moon?.longitude || 0) % 30).toFixed(2);

        let pada = result.pada || result.charts?.D9?.Moon?.nakshatraPada || result.planets?.Moon?.nakshatraPada;
        const moonLong = result.planets?.Moon?.longitude || 0;
        if (!pada && moonLong > 0) {
            pada = Math.floor((moonLong % (40 / 3)) / (10 / 3)) + 1;
        }
        if (!pada || pada < 1 || pada > 4) pada = 1;

        const rasiPada = result.rasiPada || Math.floor((moonLong % 30) / (10 / 3)) + 1;
        const rashiMeta = RASHI_DATA[sign] || {};

        const shareTitle = `My Vedic Moon Sign is ${sign} Rashi`;
        const shareText = `🌙 My Vedic Moon Sign: ${sign} Rashi ${rashiMeta.sanskrit ? `(${rashiMeta.sanskrit})` : ''}\n⭐ Birth Star (Nakshatra): ${star}\n🔢 Rasi Paada: Pada ${pada} (Charan ${pada})\n📐 Moon Degree: ${moonDeg}°\n🪐 Ruling Planet: ${rashiMeta.lord || 'Moon'}\n✨ Element: ${rashiMeta.element || '-'}\n\nDiscover your Vedic Moon Sign & Nakshatra on Way2Astro:`;
        const shareUrl = "https://way2astro.com/calculators/moon-sign-calculator";

        const shareOptions = {
            title: shareTitle,
            text: `${shareText}\n${shareUrl}`,
            url: shareUrl,
            dialogTitle: "Share Your Moon Sign (Rashi)"
        };

        try {
            const canShare = await Share.canShare().catch(() => ({ value: false }));
            if (canShare && canShare.value) {
                await Share.share(shareOptions);
                return;
            }
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share(shareOptions);
                return;
            }
        } catch (err) {
            if (err && err.name !== 'AbortError') {
                console.error("Share error:", err);
            } else {
                return;
            }
        }

        // Fallback: Copy to clipboard
        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                toast.success("Rashi details copied to clipboard!");
                return;
            }
        } catch (copyErr) {
            console.error("Clipboard copy error:", copyErr);
        }
        toast.success(`${sign} Rashi details ready to share!`);
    };

    const handleShareAtmakaraka = async () => {
        if (!result?.karakas) return;
        const ak = result.karakas.find(k => k.key === 'AK');
        const amk = result.karakas.find(k => k.key === 'AmK');
        const dk = result.karakas.find(k => k.key === 'DK');

        const akPlanet = ak?.planet || "Sun";
        const amkPlanet = amk?.planet || "Venus";
        const dkPlanet = dk?.planet || "Jupiter";

        const shareTitle = `My Jaimini Karakas: AK (${akPlanet}), AmK (${amkPlanet}), DK (${dkPlanet})`;
        const shareText = `🔮 My Jaimini Karakas (Soul & Life Indicators):\n\n👑 Atmakaraka (Soul Planet): ${akPlanet} - Soul's purpose & spiritual evolution\n💼 Amatyakaraka (Career Planet): ${amkPlanet} - Worldly vocation & professional status\n💍 Darakaraka (Spouse Planet): ${dkPlanet} - Sacred life partner & marriage blessing\n\nCalculate your Jaimini 7 Karakas on Way2Astro:`;
        const shareUrl = "https://way2astro.com/calculators/atmakaraka";

        const shareOptions = {
            title: shareTitle,
            text: `${shareText}\n${shareUrl}`,
            url: shareUrl,
            dialogTitle: "Share Jaimini Karakas"
        };

        try {
            const canShare = await Share.canShare().catch(() => ({ value: false }));
            if (canShare && canShare.value) {
                await Share.share(shareOptions);
                return;
            }
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share(shareOptions);
                return;
            }
        } catch (err) {
            if (err && err.name !== 'AbortError') {
                console.error("Share error:", err);
            } else {
                return;
            }
        }

        // Fallback: Copy to clipboard
        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                toast.success("Jaimini Karakas copied to clipboard!");
                return;
            }
        } catch (copyErr) {
            console.error("Clipboard copy error:", copyErr);
        }
        toast.success("Jaimini Karakas ready to share!");
    };

    const handleShareYoginiDasha = async () => {
        if (!result?.list) return;
        const currentYogini = result.list.find(y => new Date() >= new Date(y.start) && new Date() <= new Date(y.end)) || result.list[0];
        const info = YOGINI_DETAILS[currentYogini?.name] || {};

        const shareTitle = `My Current Yogini Dasha: ${currentYogini?.name} (${currentYogini?.lord})`;
        const shareText = `🔮 My Vedic Yogini Dasha Analysis:\n\n✨ Current Period: ${currentYogini?.name} (${currentYogini?.lord})\n📅 Duration: ${currentYogini?.start} to ${currentYogini?.end} (${currentYogini?.duration} Years)\n🌟 Nature: ${info.nature || 'Auspicious'}\n📜 Core Influence: ${info.coreMeaning || 'Major life shifts governed by ' + currentYogini?.lord}\n\nCalculate your Yogini Dasha on Way2Astro:`;
        const shareUrl = "https://way2astro.com/calculators/yogini-dasha";

        const shareOptions = {
            title: shareTitle,
            text: `${shareText}\n${shareUrl}`,
            url: shareUrl,
            dialogTitle: "Share Yogini Dasha"
        };

        try {
            const canShare = await Share.canShare().catch(() => ({ value: false }));
            if (canShare && canShare.value) {
                await Share.share(shareOptions);
                return;
            }
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share(shareOptions);
                return;
            }
        } catch (err) {
            if (err && err.name !== 'AbortError') {
                console.error("Share error:", err);
            } else {
                return;
            }
        }

        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                toast.success("Yogini Dasha details copied to clipboard!");
                return;
            }
        } catch (copyErr) {
            console.error("Clipboard copy error:", copyErr);
        }
        toast.success("Yogini Dasha ready to share!");
    };

    const handleShareSpecificYogini = async (yogini) => {
        if (!yogini) return;
        const info = YOGINI_DETAILS[yogini.name] || {};
        const shareTitle = `Yogini Dasha: ${yogini.name} (${yogini.lord})`;
        const shareText = `🔮 Yogini Dasha Period: ${yogini.name} (${yogini.lord})\n📅 Duration: ${yogini.start} to ${yogini.end} (${yogini.duration} Years)\n🌟 Nature: ${info.nature || 'Auspicious'}\n📜 Core Influence: ${info.coreMeaning || 'Major life cycle governed by ' + yogini.lord}\n\nDiscover your Yogini Dasha timeline on Way2Astro:`;
        const shareUrl = "https://way2astro.com/calculators/yogini-dasha";

        const shareOptions = {
            title: shareTitle,
            text: `${shareText}\n${shareUrl}`,
            url: shareUrl,
            dialogTitle: `Share ${yogini.name} Dasha`
        };

        try {
            const canShare = await Share.canShare().catch(() => ({ value: false }));
            if (canShare && canShare.value) {
                await Share.share(shareOptions);
                return;
            }
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share(shareOptions);
                return;
            }
        } catch (err) {
            if (err && err.name !== 'AbortError') console.error(err);
            else return;
        }

        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                toast.success(`${yogini.name} Dasha copied!`);
                return;
            }
        } catch (e) {}
        toast.success(`${yogini.name} Dasha ready!`);
    };

    const handleShareTiming = async () => {
        if (!result) return;
        const topMarriage = result.marriage?.[0];
        const topCareer = result.career?.[0];

        let shareText = `🔮 My Vedic Marriage & Career Auspicious Timing (Way2Astro):\n`;
        if (result.meta?.seventhLord) {
            shareText += `💍 7th House Lord (Marriage): ${result.meta.seventhLord}\n`;
        }
        if (result.meta?.tenthLord) {
            shareText += `💼 10th House Lord (Career): ${result.meta.tenthLord}\n`;
        }
        if (topMarriage) {
            shareText += `\n💍 Auspicious Marriage Window: ${topMarriage.mahadasha}-${topMarriage.antardasha} (${topMarriage.start} to ${topMarriage.end}) [${topMarriage.strength} Favorability]\n`;
        }
        if (topCareer) {
            shareText += `💼 Favorable Career Window: ${topCareer.mahadasha}-${topCareer.antardasha} (${topCareer.start} to ${topCareer.end}) [${topCareer.strength} Favorability]\n`;
        }
        shareText += `\nDiscover your favorable astrological windows on Way2Astro:`;
        const shareUrl = "https://way2astro.com/calculators/marriage-career";

        const shareOptions = {
            title: "My Marriage & Career Timing Analysis",
            text: `${shareText}\n${shareUrl}`,
            url: shareUrl,
            dialogTitle: "Share Auspicious Timing"
        };

        try {
            const canShare = await Share.canShare().catch(() => ({ value: false }));
            if (canShare && canShare.value) {
                await Share.share(shareOptions);
                return;
            }
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share(shareOptions);
                return;
            }
        } catch (err) {
            if (err && err.name !== 'AbortError') console.error(err);
            else return;
        }

        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                toast.success("Timing analysis copied to clipboard!");
                return;
            }
        } catch (e) {}
        toast.success("Timing analysis ready!");
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Numerology / Sun-Sign / Zodiac / Friendship do not need lat/lng
        if (type === "numerology") {
            if (!formData.name || !formData.date) {
                toast.error("Please provide your name and birth date.");
                return;
            }
            calculateNumerology();
            return;
        }

        if (type === "sun-sign") {
            if (!formData.date) {
                toast.error("Please enter your birth date.");
                return;
            }
            calculateSunSign();
            return;
        }

        if (type === "friendship") {
            if (!formData.name || !formData.partnerName) {
                toast.error("Please enter both names.");
                return;
            }
            calculateFriendship();
            return;
        }

        if (type === "zodiac-compatibility") {
            calculateZodiacComp();
            return;
        }

        // Standard birth chart calculations
        if (!formData.date || !formData.time || !formData.lat) {
            toast.error("Please provide valid birth date, time, and location.");
            return;
        }

        setLoading(true);
        try {
            let endpoint = "/astro/kundli";
            if (type === "ashtakavarga") endpoint = "/astro/ashtakavarga";
            else if (type === "atmakaraka") endpoint = "/astro/jaimini-karakas";
            else if (type === "yogini-dasha") endpoint = "/astro/yogini-dasha";
            else if (type === "marriage-career") endpoint = "/astro/marriage-career";

            const res = await api.post(endpoint, {
                date: formData.date,
                time: formData.time,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
                gender: formData.gender
            });

            if (res.data?.success) {
                const apiData = res.data.data;

                // 1. ASCENDANT / LAGNA: PROPER EXTRACTION (FIXES LAGNA RESULT NOT SHOWING)
                if (type === "ascendant") {
                    let ascLongitude = 0;
                    if (apiData.houses && apiData.houses.ascendant !== undefined) {
                        ascLongitude = typeof apiData.houses.ascendant === 'number' ? apiData.houses.ascendant : parseFloat(apiData.houses.ascendant) || 0;
                    } else if (apiData.houses && apiData.houses['1'] !== undefined) {
                        ascLongitude = typeof apiData.houses['1'] === 'object' ? (apiData.houses['1'].longitude || 0) : (parseFloat(apiData.houses['1']) || 0);
                    } else if (apiData.planets && apiData.planets.Ascendant !== undefined) {
                        ascLongitude = typeof apiData.planets.Ascendant === 'object' ? (apiData.planets.Ascendant.longitude || 0) : (parseFloat(apiData.planets.Ascendant) || 0);
                    } else if (apiData.ascendant !== undefined) {
                        ascLongitude = typeof apiData.ascendant === 'number' ? apiData.ascendant : parseFloat(apiData.ascendant) || 0;
                    }

                    const ascSignIndex = Math.floor((ascLongitude || 0) / 30) % 12;
                    const ascSignName = SIGNS[ascSignIndex] || "Aries";
                    const ascDegree = ((ascLongitude || 0) % 30).toFixed(2);
                    const ascData = ASCENDANT_DATA[ascSignName] || { lord: "Mars", element: "Fire", symbol: "♈", traits: "Courageous vitality and strong physical presence." };

                    setResult({
                        ...apiData,
                        ascSignName,
                        ascDegree,
                        lord: ascData.lord,
                        element: ascData.element,
                        symbol: ascData.symbol,
                        traits: ascData.traits,
                        nakshatra: apiData.dashas?.birthNakshatra || "-",
                        tithi: apiData.panchang?.tithi || "-",
                        vara: apiData.panchang?.vara || "-",
                        moonSign: SIGNS[(apiData.planets?.Moon?.sign || 1) - 1]
                    });
                }
                // 2. NAKSHATRA: FULL WEB INFORMATION
                else if (type === "nakshatra") {
                    const nakshatraName = apiData.dashas?.birthNakshatra || "-";
                    const pada = apiData.charts?.D9?.Moon?.nakshatraPada || apiData.planets?.Moon?.nakshatraPada || 1;
                    const moonSignIndex = apiData.planets?.Moon?.sign;
                    const moonSignName = moonSignIndex ? SIGNS[moonSignIndex - 1] : "-";
                    const moonDeg = ((apiData.planets?.Moon?.longitude || 0) % 30).toFixed(2);
                    const tithi = apiData.panchang?.tithi || "-";
                    const vara = apiData.panchang?.vara || "-";
                    const yoga = apiData.panchang?.yoga || "-";
                    const karana = apiData.panchang?.karana || "-";

                    const metaData = NAKSHATRA_DATA[nakshatraName] || {
                        lord: "Moon",
                        deity: "Universal Deity",
                        symbol: "Cosmic Star",
                        gana: "Deva",
                        element: "Aether",
                        animal: "Sacred Animal",
                        traits: "Illuminating intellect, natural spiritual sensitivity, and pursuit of higher purpose."
                    };

                    setResult({
                        ...apiData,
                        nakshatraName,
                        pada,
                        moonSignName,
                        moonDeg,
                        tithi,
                        vara,
                        yoga,
                        karana,
                        ...metaData
                    });
                }
                // 3. MOON SIGN / RASHI: FULL WEB & PAADA INFORMATION
                else if (type === "moon-sign") {
                    const moonSignIndex = apiData.planets?.Moon?.sign || 1;
                    const moonSignName = SIGNS[moonSignIndex - 1] || "Aries";
                    const moonLongitude = apiData.planets?.Moon?.longitude || 0;
                    const moonDeg = ((moonLongitude % 30) || 0).toFixed(2);
                    const nakshatraName = apiData.dashas?.birthNakshatra || apiData.panchang?.nakshatra || "-";

                    // Accurate Pada calculation (1 to 4)
                    let pada = apiData.charts?.D9?.Moon?.nakshatraPada || apiData.planets?.Moon?.nakshatraPada;
                    if (!pada && moonLongitude > 0) {
                        const degInNak = moonLongitude % (40 / 3);
                        pada = Math.floor(degInNak / (10 / 3)) + 1;
                    }
                    if (!pada || pada < 1 || pada > 4) pada = 1;

                    // Rasi Pada (1 to 9): each Rashi contains 9 padas
                    const rasiPada = Math.floor(((moonLongitude % 30) || 0) / (10 / 3)) + 1;

                    const tithi = apiData.panchang?.tithi || "-";
                    const vara = apiData.panchang?.vara || "-";
                    const yoga = apiData.panchang?.yoga || "-";
                    const karana = apiData.panchang?.karana || "-";
                    const relation = apiData.planets?.Moon?.relation || "Neutral";

                    const rashiMeta = RASHI_DATA[moonSignName] || {
                        sanskrit: "Chandra Rashi",
                        lord: "Moon",
                        element: "Water",
                        quality: "Chara (Movable)",
                        symbol: "🌙",
                        deity: "Lord Shiva",
                        traits: "Your Moon sign reflects your inner emotions, instincts, intuitive intellect, and mental disposition."
                    };

                    const nakshatraMeta = NAKSHATRA_DATA[nakshatraName] || null;

                    setResult({
                        ...apiData,
                        moonSignName,
                        moonSignIndex,
                        moonDeg,
                        nakshatraName,
                        pada,
                        rasiPada,
                        tithi,
                        vara,
                        yoga,
                        karana,
                        relation,
                        ...rashiMeta,
                        nakshatraLord: nakshatraMeta?.lord || "-",
                        nakshatraDeity: nakshatraMeta?.deity || "-",
                        nakshatraGana: nakshatraMeta?.gana || "-"
                    });
                } else {
                    setResult(apiData);
                }

                setBirthDetails(formData);
            } else {
                toast.error("Failed to perform calculation. Please check details.");
            }
        } catch (error) {
            console.error("Calculation error:", error);
            toast.error(error.response?.data?.message || "Calculation failed.");
        } finally {
            setLoading(false);
        }
    };

    // Client-side calculations
    const calculateNumerology = () => {
        const d = new Date(formData.date);
        const digits = `${d.getDate()}${d.getMonth() + 1}${d.getFullYear()}`.split('');
        const reduce = (n) => {
            if ([11, 22, 33].includes(n)) return n;
            if (n < 10) return n;
            const sum = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
            return reduce(sum);
        };
        const lifePath = reduce(digits.reduce((a, b) => a + parseInt(b), 0));
        
        // Destiny number from name (Pythagorean)
        const charMap = { a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3, d: 4, m: 4, v: 4, e: 5, n: 5, w: 5, f: 6, o: 6, x: 6, g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, r: 9, i: 9 };
        const cleanName = (formData.name || "").toLowerCase().replace(/[^a-z]/g, '');
        let nameSum = 0;
        for (let char of cleanName) nameSum += charMap[char] || 0;
        const destinyNumber = reduce(nameSum);

        setResult({ lifePath, destinyNumber, name: formData.name });
    };

    const calculateSunSign = () => {
        const d = new Date(formData.date);
        const m = d.getMonth() + 1;
        const day = d.getDate();
        let sign = "Aries";
        let element = "Fire";
        let ruler = "Mars";
        if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) { sign = "Aries"; element = "Fire"; ruler = "Mars"; }
        else if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) { sign = "Taurus"; element = "Earth"; ruler = "Venus"; }
        else if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) { sign = "Gemini"; element = "Air"; ruler = "Mercury"; }
        else if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) { sign = "Cancer"; element = "Water"; ruler = "Moon"; }
        else if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) { sign = "Leo"; element = "Fire"; ruler = "Sun"; }
        else if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) { sign = "Virgo"; element = "Earth"; ruler = "Mercury"; }
        else if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) { sign = "Libra"; element = "Air"; ruler = "Venus"; }
        else if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) { sign = "Scorpio"; element = "Water"; ruler = "Mars & Pluto"; }
        else if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) { sign = "Sagittarius"; element = "Fire"; ruler = "Jupiter"; }
        else if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) { sign = "Capricorn"; element = "Earth"; ruler = "Saturn"; }
        else if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) { sign = "Aquarius"; element = "Air"; ruler = "Saturn & Uranus"; }
        else { sign = "Pisces"; element = "Water"; ruler = "Jupiter & Neptune"; }

        setResult({ sign, element, ruler });
    };

    const calculateFriendship = () => {
        const sum1 = (formData.name || "").length;
        const sum2 = (formData.partnerName || "").length;
        const score = 68 + ((sum1 * 7 + sum2 * 11) % 30);
        setResult({ score, friend1: formData.name, friend2: formData.partnerName });
    };

    const calculateZodiacComp = () => {
        const s1 = formData.sign1;
        const s2 = formData.sign2;
        const idx1 = SIGNS.indexOf(s1);
        const idx2 = SIGNS.indexOf(s2);
        const diff = Math.abs(idx1 - idx2);
        let score = 72;
        let harmony = "Good";
        if (s1 === s2) { score = 88; harmony = "Soulful Mirror"; }
        else if ([4, 8].includes(diff % 12)) { score = 96; harmony = "Trine Harmony (Same Element)"; }
        else if ([2, 10].includes(diff % 12)) { score = 84; harmony = "Sextile Synergy"; }
        else if ([6].includes(diff % 12)) { score = 90; harmony = "Opposites Attract"; }
        else { score = 70; harmony = "Dynamic Growth"; }

        setResult({ score, sign1: s1, sign2: s2, harmony });
    };

    const IconComp = meta.icon;

    // Helper to get planet icon for Gochar
    const getPlanetColor = (name) => {
        switch (name) {
            case 'Sun': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Moon': return 'text-purple-300 bg-purple-400/10 border-purple-400/20';
            case 'Mars': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'Mercury': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Jupiter': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Venus': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
            case 'Saturn': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Rahu': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
            case 'Ketu': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            default: return 'text-slate-300 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-24 overflow-x-hidden">
            {/* Header */}
            <div className="pt-2 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-center max-w-[220px]">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest block truncate ${meta.color}`}>
                        {meta.subtitle}
                    </span>
                    <h1 className="text-base font-black text-white tracking-tight leading-tight truncate">
                        {meta.title}
                    </h1>
                </div>
                <div className="w-10" />
            </div>

            {/* Description Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent border border-violet-500/20 backdrop-blur-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 shrink-0">
                    <IconComp size={18} />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug font-medium">
                    {meta.desc}
                </p>
            </div>

            {/* ============================================================== */}
            {/* 1. SPECIAL CASE: GOCHAR (LIVE PLANETS) - WORKS LIKE IN THE WEB! */}
            {/* NO NAME FIELD, NO BIRTH FORM REQUIRED! LOADS IMMEDIATELY!       */}
            {/* ============================================================== */}
            {type === "gochar" ? (
                <div className="space-y-4">
                    {/* Live Status Bar & Location Search */}
                    <CosmicCard noHover className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                                    Live Skies Now
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today
                            </span>
                        </div>

                        {/* Location Selector */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin size={12} className="text-violet-400" /> City for Local Transit
                            </label>
                            <LocationSearch
                                defaultValue={gocharLocation.place}
                                onLocationSelect={handleGocharLocationSelect}
                                placeholder="Search city for local sky positions..."
                            />
                            {gocharLocation.place && (
                                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
                                    <CheckCircle2 size={12} /> {gocharLocation.place}
                                </p>
                            )}
                        </div>

                        {/* View Mode Toggle: Solar Cosmos vs Vedic Chart vs Table */}
                        <div className="grid grid-cols-3 gap-1 bg-white/[0.05] p-1 rounded-2xl border border-white/10 mt-2">
                            <button
                                onClick={() => setGocharViewMode("cosmos")}
                                className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${gocharViewMode === 'cosmos' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <span>🪐</span> Solar Cosmos
                            </button>
                            <button
                                onClick={() => setGocharViewMode("chart")}
                                className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${gocharViewMode === 'chart' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <PieChart size={13} /> Vedic Chart
                            </button>
                            <button
                                onClick={() => setGocharViewMode("table")}
                                className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${gocharViewMode === 'table' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <List size={13} /> Table
                            </button>
                        </div>
                    </CosmicCard>

                    {/* Gochar Content */}
                    {loading ? (
                        <CosmicCard noHover className="p-8 text-center space-y-3">
                            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin mx-auto" />
                            <p className="text-xs font-bold text-slate-300">Aligning current planetary positions with Swiss Ephemeris...</p>
                        </CosmicCard>
                    ) : result?.planets ? (
                        <div className="space-y-4">
                            {/* 1. SOLAR COSMOS VIEW (PLANETS IN UNIVERSE WITH NAMES & POSITIONS) */}
                            {gocharViewMode === "cosmos" && (
                                <CosmicSolarUniverse planets={result.planets} />
                            )}

                            {/* 2. VEDIC CHART VIEW (NORTH & SOUTH INDIAN STYLES) */}
                            {gocharViewMode === "chart" && (
                                <CosmicCard noHover className="p-4 space-y-4">
                                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                                                {chartStyle === 'north' ? 'North Indian Diamond Kundli' : 'South Indian Square Kundli'}
                                            </span>
                                            <h3 className="text-base font-black text-white mt-0.5">Current Celestial Houses</h3>
                                        </div>

                                        {/* Chart Style Switcher (North vs South) */}
                                        <div className="flex items-center bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
                                            <button
                                                onClick={() => setChartStyle("north")}
                                                className={`px-2.5 py-1 text-[10px] rounded-lg transition-all ${
                                                    chartStyle === 'north' ? 'bg-amber-400 text-slate-900 shadow font-black' : 'text-slate-400 font-bold hover:text-white'
                                                }`}
                                            >
                                                North
                                            </button>
                                            <button
                                                onClick={() => setChartStyle("south")}
                                                className={`px-2.5 py-1 text-[10px] rounded-lg transition-all ${
                                                    chartStyle === 'south' ? 'bg-amber-400 text-slate-900 shadow font-black' : 'text-slate-400 font-bold hover:text-white'
                                                }`}
                                            >
                                                South
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-[340px] mx-auto py-2">
                                        <KundliChart
                                            planets={result.planets}
                                            ascendantSign={result.planets?.Ascendant?.sign || result.houses?.[0]?.sign || 1}
                                            style={chartStyle}
                                            smallMode={true}
                                            chartLanguage="English"
                                        />
                                    </div>

                                    <p className="text-[10px] text-slate-400 text-center">
                                        {chartStyle === 'north' 
                                            ? 'North Indian style: Houses remain fixed with 1st house at top center; signs rotate.' 
                                            : 'South Indian style: 12 zodiac signs remain fixed clockwise from Pisces; houses rotate.'}
                                    </p>
                                </CosmicCard>
                            )}

                            {/* 3. PLANETARY TABLE VIEW */}
                            {gocharViewMode === "table" && (
                                <CosmicCard noHover className="p-4 space-y-3">
                                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planet</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sign & Degree</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motion</span>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(result.planets).map(([pName, pData]) => {
                                            if (pName === 'Ascendant' || pName === 'As') return null;
                                            const signName = SIGNS[pData.sign - 1] || 'Aries';
                                            const deg = Math.floor(pData.longitude % 30);
                                            const min = Math.floor((pData.longitude % 1) * 60);

                                            return (
                                                <div 
                                                    key={pName} 
                                                    className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${getPlanetColor(pName)}`}>
                                                            {pName.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-white block">{pName}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium block">
                                                                {ZODIAC_SYMBOLS[signName]} {signName}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-center">
                                                        <span className="text-xs font-mono font-bold text-amber-300">
                                                            {deg}° {min}&apos;
                                                        </span>
                                                        <span className="text-[8px] text-slate-500 uppercase block font-semibold">Degree</span>
                                                    </div>

                                                    <div>
                                                        {pData.retrograde ? (
                                                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                                                Retrograde
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                                                                Direct
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CosmicCard>
                            )}

                            {/* Transit Insights Card */}
                            <CosmicCard noHover className="p-4 space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-300" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Vedic Transit Insights</h4>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                                    Gochar refers to the current planetary transits moving through the 12 zodiac signs. While your Janma Kundli is fixed, transit motions bring the exact timing triggers for events in health, wealth, and destiny.
                                </p>
                            </CosmicCard>

                            {/* Refresh Button */}
                            <button
                                onClick={() => fetchLiveGochar()}
                                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                            >
                                <RefreshCw size={14} /> Refresh Live Positions
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (type === "choghadiya" || type === "hora-muhurat") ? (
                /* ============================================================== */
                /* 2. CHOGHADIYA & HORA MUHURAT - REAL-TIME MUHURATS LIKE ON WEB!  */
                /* NO BIRTH DETAILS FORM! SELECT DATE & LOCATION, LOADS REAL DATA! */
                /* ============================================================== */
                <div className="space-y-4">
                    <CosmicCard noHover className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={13} /> {type === "choghadiya" ? "Today Choghadiya Muhurat" : "Today Hora Muhurat"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {muhuratLocation.place.split(',')[0]}
                            </span>
                        </div>

                        {/* Date & Location Controls */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Muhurat Date</label>
                                <input
                                    type="date"
                                    value={muhuratDate}
                                    onChange={(e) => setMuhuratDate(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-bold [color-scheme:dark]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">City / Place</label>
                                <LocationSearch
                                    defaultValue={muhuratLocation.place}
                                    onLocationSelect={handleMuhuratLocationSelect}
                                    placeholder="Search City..."
                                />
                            </div>
                        </div>

                        {/* Celestial Sunrise / Sunset Details (Matching Web!) */}
                        {result?.sun && (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-between px-3">
                                    <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                                        ☀️ Sunrise
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white">
                                        {result.sun.sunrise}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-between px-3">
                                    <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1.5">
                                        🌙 Sunset
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white">
                                        {result.sun.sunset}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Day / Night Toggle */}
                        <div className="flex rounded-xl bg-white/[0.05] p-1 border border-white/10 mt-2">
                            <button
                                onClick={() => setActiveTab("day")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'day' ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                ☀️ Day {type === "choghadiya" ? "Choghadiya" : "Horas"}
                            </button>
                            <button
                                onClick={() => setActiveTab("night")}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'night' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/40 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                🌙 Night {type === "choghadiya" ? "Choghadiya" : "Horas"}
                            </button>
                        </div>
                    </CosmicCard>

                    {/* Content Display */}
                    {loading ? (
                        <CosmicCard noHover className="p-8 text-center space-y-3">
                            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin mx-auto" />
                            <p className="text-xs font-bold text-slate-300">Calculating planetary muhurats with astronomical sunrise/sunset...</p>
                        </CosmicCard>
                    ) : type === "choghadiya" && result?.choghadiya ? (
                        <div className="space-y-3">
                            <CosmicCard noHover className="p-4 space-y-2">
                                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choghadiya</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Interval</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auspiciousness</span>
                                </div>
                                <div className="space-y-2">
                                    {(activeTab === 'day' ? result.choghadiya.day : result.choghadiya.night || []).map((c, idx) => {
                                        const cInfo = CHOGHADIYA_INFO[c.name] || { desc: "Muhurat period.", type: "Neutral", color: "text-slate-300 bg-white/5 border-white/10" };
                                        const isCurrent = isCurrentMuhuratSlot(c.start, c.end, muhuratDate);
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`p-3 rounded-2xl transition-all flex items-center justify-between relative overflow-hidden ${
                                                    isCurrent 
                                                        ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border-2 border-emerald-400/90 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40' 
                                                        : 'bg-white/[0.03] border border-white/10'
                                                }`}
                                            >
                                                {isCurrent && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400 shadow-[2px_0_10px_rgba(52,211,153,0.9)]" />
                                                )}
                                                <div className={isCurrent ? "pl-2" : ""}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-white">{c.name}</span>
                                                        {isCurrent && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse shadow-md">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                                                Running Now
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cInfo.desc}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-emerald-300 font-extrabold' : 'text-amber-300'}`}>
                                                        {c.start} - {c.end}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${cInfo.color}`}>
                                                        {cInfo.type}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CosmicCard>

                            <button
                                onClick={() => fetchMuhuratData()}
                                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                            >
                                <RefreshCw size={14} /> Refresh Choghadiya Timings
                            </button>
                        </div>
                    ) : type === "hora-muhurat" && result?.hora ? (
                        <div className="space-y-3">
                            <CosmicCard noHover className="p-4 space-y-2">
                                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planet Hora</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Interval</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Significance</span>
                                </div>
                                <div className="space-y-2">
                                    {(activeTab === 'day' ? result.hora.day : result.hora.night || []).map((h, idx) => {
                                        const planetInfo = HORA_PLANET_INFO[h.planet] || { desc: "Focused action.", auspicious: "Good", color: "text-slate-300 bg-white/5 border-white/10" };
                                        const isCurrent = isCurrentMuhuratSlot(h.start, h.end, muhuratDate);
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`p-3 rounded-2xl transition-all flex items-center justify-between relative overflow-hidden ${
                                                    isCurrent 
                                                        ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border-2 border-emerald-400/90 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40' 
                                                        : 'bg-white/[0.03] border border-white/10'
                                                }`}
                                            >
                                                {isCurrent && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400 shadow-[2px_0_10px_rgba(52,211,153,0.9)]" />
                                                )}
                                                <div className={isCurrent ? "pl-2" : ""}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-white">{h.planet} Hora</span>
                                                        {isCurrent && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse shadow-md">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                                                Running Now
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{planetInfo.desc}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-emerald-300 font-extrabold' : 'text-amber-300'}`}>
                                                        {h.start} - {h.end}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${planetInfo.color}`}>
                                                        {planetInfo.auspicious}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CosmicCard>

                            <button
                                onClick={() => fetchMuhuratData()}
                                className="w-full py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                            >
                                <RefreshCw size={14} /> Refresh Hora Timings
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (
                /* ============================================================== */
                /* 3. ALL OTHER BIRTH CALCULATORS (KUNDLI, LAGNA, NAKSHATRA, ETC) */
                /* ============================================================== */
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                        >
                            <CosmicCard noHover className="p-5 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {type === "zodiac-compatibility" ? (
                                        /* Zodiac Selector */
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Zodiac Sign</label>
                                                <select
                                                    value={formData.sign1}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, sign1: e.target.value }))}
                                                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-bold"
                                                >
                                                    {SIGNS.map(s => <option key={s} value={s} className="bg-[#090d24]">{ZODIAC_SYMBOLS[s]} {s}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Second Zodiac Sign</label>
                                                <select
                                                    value={formData.sign2}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, sign2: e.target.value }))}
                                                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-bold"
                                                >
                                                    {SIGNS.map(s => <option key={s} value={s} className="bg-[#090d24]">{ZODIAC_SYMBOLS[s]} {s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ) : type === "friendship" ? (
                                        /* Friendship Names */
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Enter your name"
                                                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Friend&apos;s Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.partnerName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                                                    placeholder="Enter friend's name"
                                                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-medium"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* Standard Vedic Inputs */
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Enter your name"
                                                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Birth Date</label>
                                                    <div className="relative">
                                                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                        <input
                                                            type="date"
                                                            required
                                                            value={formData.date}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                            className="w-full pl-10 pr-2 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-medium [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>

                                                {type !== "numerology" && type !== "sun-sign" && (
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Birth Time</label>
                                                        <div className="relative">
                                                            <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                            <input
                                                                type="time"
                                                                required
                                                                value={formData.time}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                                                className="w-full pl-10 pr-2 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-medium [color-scheme:dark]"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {type !== "numerology" && type !== "sun-sign" && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Place of Birth</label>
                                                    <LocationSearch
                                                        defaultValue={formData.place}
                                                        onLocationSelect={handleLocationSelect}
                                                        placeholder="Search birth city..."
                                                    />
                                                    {formData.place && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pl-1 pt-0.5">
                                                            <CheckCircle2 size={12} />
                                                            <span className="truncate">{formData.place}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-[0_8px_30px_rgba(139,92,246,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles size={16} /> Calculate {meta.title.split(' ')[0]}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </CosmicCard>
                        </motion.div>
                    ) : (
                        /* Dedicated Result Screens For Each Service */
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-4"
                        >
                            {/* 1. ASCENDANT / LAGNA RESULT (FIXES LAGNA RESULTS NOT SHOWING) */}
                            {type === "ascendant" && result?.ascSignName && (
                                <div className="space-y-4">
                                    <CosmicCard noHover className="p-6 text-center space-y-4 relative overflow-hidden">
                                        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-4xl mx-auto shadow-inner text-amber-300">
                                            {result.symbol || "🌅"}
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.25em] block">
                                                Your Rising Sign is
                                            </span>
                                            <h2 className="text-4xl font-black text-white mt-1 tracking-tight">
                                                {result.ascSignName} Lagna
                                            </h2>
                                            <span className="inline-block mt-2 bg-amber-500/20 text-amber-200 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/30">
                                                Rising at {result.ascDegree}°
                                            </span>
                                        </div>

                                        {/* Detailed Astrological Identity Grid (Matching Web!) */}
                                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-left space-y-3 mt-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                                <Star size={14} className="text-amber-300" />
                                                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                                    Astrological Identity
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ascendant Sign</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.ascSignName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rising Degree</p>
                                                    <p className="text-xs font-extrabold text-amber-300 mt-0.5">{result.ascDegree}°</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lagna Lord</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.lord}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Elemental Force</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.element}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Nakshatra</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.nakshatra}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moon Sign (Rashi)</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.moonSign}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Tithi</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.tithi}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Vara (Day)</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.vara}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Physical Appearance & Life Outlook */}
                                        <div className="bg-gradient-to-r from-amber-600/15 via-orange-600/10 to-transparent border border-amber-500/20 rounded-2xl p-4 text-left space-y-1.5">
                                            <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider">
                                                Physical Personality & Life Aura
                                            </span>
                                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                {result.traits}
                                            </p>
                                        </div>
                                    </CosmicCard>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                                        >
                                            <RotateCcw size={14} /> Calculate Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: `My Rising Sign is ${result.ascSignName} Lagna`,
                                                        text: `My Vedic Ascendant is ${result.ascSignName} Lagna (${result.ascDegree}°)! Discovered on Way2Astro.`
                                                    }).catch(() => {});
                                                } else {
                                                    toast.success("Ascendant copied!");
                                                }
                                            }}
                                            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/20"
                                        >
                                            <Send size={14} /> Share Lagna
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 2. NAKSHATRA (BIRTH STAR) RESULT - ALL WEB INFORMATION INCLUDED! */}
                            {type === "nakshatra" && result?.nakshatraName && (
                                <div className="space-y-4">
                                    <CosmicCard noHover className="p-6 text-center space-y-4 relative overflow-hidden">
                                        <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner text-amber-300">
                                            <Star size={38} className="text-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)]" fill="currentColor" />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.25em] block">
                                                Your Birth Star is
                                            </span>
                                            <h2 className="text-4xl font-black text-white mt-1 tracking-tight">
                                                {result.nakshatraName}
                                            </h2>
                                            <span className="inline-block mt-2 bg-violet-500/25 text-violet-200 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-violet-500/40 shadow-sm">
                                                Pada {result.pada}
                                            </span>
                                        </div>

                                        {/* Detailed Insights Grid (Matching Web!) */}
                                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-left space-y-3 mt-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                                <Sparkles size={14} className="text-amber-300" />
                                                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                                    Detailed Insights
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nakshatra</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.nakshatraName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pada (Quarter)</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">Pada {result.pada}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moon Sign (Rashi)</p>
                                                    <p className="text-xs font-extrabold text-amber-300 mt-0.5">{result.moonSignName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ruling Planet</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.lord}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Presiding Deity</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.deity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cosmic Symbol</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.symbol}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gana (Nature)</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.gana}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Element (Tattva)</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.element}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Tithi</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.tithi}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Vara (Day)</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.vara}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moon Celestial Degree</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.moonDeg}°</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Animal Yoni</p>
                                                    <p className="text-xs font-extrabold text-white mt-0.5">{result.animal}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Soul Destiny & Nature Card */}
                                        <div className="bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent border border-violet-500/20 rounded-2xl p-4 text-left space-y-1.5">
                                            <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider">
                                                Core Nature & Destiny Profile
                                            </span>
                                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                {result.traits}
                                            </p>
                                        </div>
                                    </CosmicCard>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                                        >
                                            <RotateCcw size={14} /> Calculate Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: `My Nakshatra is ${result.nakshatraName}`,
                                                        text: `My Vedic Birth Star is ${result.nakshatraName} (Pada ${result.pada})! Discovered on Way2Astro.`
                                                    }).catch(() => {});
                                                } else {
                                                    toast.success("Nakshatra copied!");
                                                }
                                            }}
                                            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-violet-500/20"
                                        >
                                            <Send size={14} /> Share Nakshatra
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 3. ASHTAKAVARGA RESULT */}
                            {type === "ashtakavarga" && result?.sav && (
                                <CosmicCard noHover className="p-5 space-y-4">
                                    <div className="text-center">
                                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Sarvashtakavarga (SAV) Points</span>
                                        <h3 className="text-lg font-black text-white mt-0.5">Strength Across 12 Signs</h3>
                                        <p className="text-[10px] text-slate-400 mt-1">28+ points indicate high strength, wealth & auspicious energy.</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(result.sav).map(([sign, val]) => (
                                            <div 
                                                key={sign} 
                                                className={`p-2.5 rounded-xl border text-center transition-all ${
                                                    val >= 28 
                                                        ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' 
                                                        : val < 24 
                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                                                        : 'bg-white/[0.04] border-white/10 text-slate-300'
                                                }`}
                                            >
                                                <span className="text-[10px] font-bold block">{sign}</span>
                                                <span className="text-lg font-black block mt-0.5">{val}</span>
                                                <span className="text-[8px] uppercase tracking-wider block opacity-75">
                                                    {val >= 28 ? 'Benefic' : val < 24 ? 'Challenging' : 'Moderate'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CosmicCard>
                            )}

                            {/* 4. ATMAKARAKA / JAIMINI KARAKAS RESULT */}
                            {type === "atmakaraka" && result?.karakas && (() => {
                                const ak = result.karakas.find(k => k.key === 'AK');
                                const amk = result.karakas.find(k => k.key === 'AmK');
                                const dk = result.karakas.find(k => k.key === 'DK');

                                const akPlanet = ak?.planet || "Sun";
                                const amkPlanet = amk?.planet || "Venus";
                                const dkPlanet = dk?.planet || "Jupiter";

                                const akMeaning = JAIMINI_PLANET_MEANINGS.AK[akPlanet] || {
                                    title: "Soul Purpose & Spiritual Journey",
                                    summary: `${akPlanet} as your Atmakaraka represents your core soul essence, inner spiritual lessons, and self-realization path in this life.`,
                                    keywords: ["Soul Purpose", "Spiritual Growth", "Self-Realization"]
                                };

                                const amkMeaning = JAIMINI_PLANET_MEANINGS.AmK[amkPlanet] || {
                                    title: "Career Destiny & Worldly Mission",
                                    summary: `${amkPlanet} as your Amatyakaraka guides your intellect, professional vocation, status, and worldly execution.`,
                                    keywords: ["Career", "Intellect", "Professional Status"]
                                };

                                const dkMeaning = JAIMINI_PLANET_MEANINGS.DK[dkPlanet] || {
                                    title: "Spouse & Sacred Partnerships",
                                    summary: `${dkPlanet} as your Darakaraka reflects your life partner, relationship qualities, and soul connections in marriage.`,
                                    keywords: ["Marriage", "Soul Partner", "Companionship"]
                                };

                                return (
                                    <div className="space-y-4">
                                        {/* Header Card */}
                                        <CosmicCard noHover className="p-6 text-center space-y-3 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                            <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner text-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.5)]">
                                                <Crown size={32} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.25em] block">
                                                    Jaimini 7 Karakas Analysis
                                                </span>
                                                <h2 className="text-2xl font-black text-white mt-1">
                                                    Your Soul & Destiny Indicators
                                                </h2>
                                                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                                                    Revealing your Soul (AK), Career (AmK), and Spouse (DK) through Jaimini planetary degrees.
                                                </p>
                                            </div>
                                        </CosmicCard>

                                        {/* THE BIG THREE: AK, AmK, DK DETAILED SUMMARY CARDS */}
                                        <div className="space-y-3">
                                            {/* 1. ATMAKARAKA (AK) */}
                                            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-950/20 border border-amber-400/30 shadow-lg relative overflow-hidden space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-amber-400/25 border border-amber-400/50 flex items-center justify-center font-black text-xs text-amber-300 shadow">
                                                            AK
                                                        </span>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider block">
                                                                Soul Planet (The King)
                                                            </span>
                                                            <h3 className="text-base font-black text-white">
                                                                Atmakaraka • {akPlanet}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                                                        {ak?.degree !== undefined ? `${Math.floor(ak.degree)}° ${Math.floor((ak.degree % 1) * 60)}'` : akPlanet}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 pt-1 border-t border-amber-400/15">
                                                    <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                                                        <Crown size={13} className="text-amber-300" />
                                                        {akMeaning.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                        {akMeaning.summary}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {akMeaning.keywords.map((kw, i) => (
                                                        <span key={i} className="text-[10px] font-bold bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/20">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 2. AMATYAKARAKA (AmK) */}
                                            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-purple-950/20 border border-purple-400/30 shadow-lg relative overflow-hidden space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-purple-400/25 border border-purple-400/50 flex items-center justify-center font-black text-xs text-purple-200 shadow">
                                                            AmK
                                                        </span>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-purple-300 tracking-wider block">
                                                                Career Planet (The Minister)
                                                            </span>
                                                            <h3 className="text-base font-black text-white">
                                                                Amatyakaraka • {amkPlanet}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-purple-200 bg-purple-400/20 px-3 py-1 rounded-full border border-purple-400/30">
                                                        {amk?.degree !== undefined ? `${Math.floor(amk.degree)}° ${Math.floor((amk.degree % 1) * 60)}'` : amkPlanet}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 pt-1 border-t border-purple-400/15">
                                                    <h4 className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                                                        <Briefcase size={13} className="text-purple-300" />
                                                        {amkMeaning.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                        {amkMeaning.summary}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {amkMeaning.keywords.map((kw, i) => (
                                                        <span key={i} className="text-[10px] font-bold bg-purple-400/10 text-purple-300 px-2 py-0.5 rounded-md border border-purple-400/20">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 3. DARAKARAKA (DK) */}
                                            <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-rose-950/20 border border-rose-400/30 shadow-lg relative overflow-hidden space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-rose-400/25 border border-rose-400/50 flex items-center justify-center font-black text-xs text-rose-200 shadow">
                                                            DK
                                                        </span>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-rose-300 tracking-wider block">
                                                                Spouse & Partner Planet
                                                            </span>
                                                            <h3 className="text-base font-black text-white">
                                                                Darakaraka • {dkPlanet}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-rose-200 bg-rose-400/20 px-3 py-1 rounded-full border border-rose-400/30">
                                                        {dk?.degree !== undefined ? `${Math.floor(dk.degree)}° ${Math.floor((dk.degree % 1) * 60)}'` : dkPlanet}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 pt-1 border-t border-rose-400/15">
                                                    <h4 className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                                                        <Heart size={13} className="text-rose-300" fill="currentColor" />
                                                        {dkMeaning.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                        {dkMeaning.summary}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {dkMeaning.keywords.map((kw, i) => (
                                                        <span key={i} className="text-[10px] font-bold bg-rose-400/10 text-rose-300 px-2 py-0.5 rounded-md border border-rose-400/20">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Complete 7 Jaimini Karakas Breakdown List */}
                                        <CosmicCard noHover className="p-5 space-y-3">
                                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                                <div>
                                                    <h3 className="text-sm font-black text-white">Complete 7 Jaimini Karakas</h3>
                                                    <p className="text-[10px] text-slate-400 font-medium">Calculated by Highest to Lowest Planetary Longitude</p>
                                                </div>
                                                <span className="text-[9px] font-extrabold uppercase bg-white/[0.06] text-amber-300 px-2 py-0.5 rounded-md border border-white/10">
                                                    7 Scheme
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {result.karakas.map((k) => (
                                                    <div key={k.key} className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                                                k.key === 'AK' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow' :
                                                                k.key === 'AmK' ? 'bg-purple-400/20 text-purple-300 border border-purple-400/40' :
                                                                k.key === 'DK' ? 'bg-rose-400/20 text-rose-300 border border-rose-400/40' :
                                                                'bg-white/[0.06] text-slate-300'
                                                            }`}>
                                                                {k.key}
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold text-white block">{k.name}</span>
                                                                <span className="text-[10px] text-slate-400 font-medium block">{k.signifies}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg border block ${
                                                                k.key === 'AK' ? 'text-amber-300 bg-amber-400/10 border-amber-400/20' :
                                                                k.key === 'AmK' ? 'text-purple-300 bg-purple-400/10 border-purple-400/20' :
                                                                k.key === 'DK' ? 'text-rose-300 bg-rose-400/10 border-rose-400/20' :
                                                                'text-white bg-white/[0.06] border-white/10'
                                                            }`}>
                                                                {k.planet}
                                                            </span>
                                                            {k.degree !== undefined && (
                                                                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                                                    {Math.floor(k.degree)}° {Math.floor((k.degree % 1) * 60)}'
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CosmicCard>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2.5">
                                            <button
                                                onClick={() => setResult(null)}
                                                className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer"
                                            >
                                                <RotateCcw size={14} /> Calculate Again
                                            </button>
                                            <button
                                                onClick={handleShareAtmakaraka}
                                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                                            >
                                                <Share2 size={14} /> Share Karakas
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 5. DASHA PERIODS RESULT */}
                            {type === "dasha-periods" && result?.dashas?.list && (
                                <CosmicCard noHover className="p-5 space-y-4">
                                    <div className="text-center">
                                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Vimshottari Mahadasha</span>
                                        <h3 className="text-lg font-black text-white mt-0.5">120-Year Planetary Timeline</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {result.dashas.list.map((dasha, idx) => {
                                            const isCurrent = new Date() >= new Date(dasha.start) && new Date() <= new Date(dasha.end);
                                            return (
                                                <div 
                                                    key={idx}
                                                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                                                        isCurrent 
                                                            ? 'bg-violet-600/20 border-violet-400/40 shadow-sm' 
                                                            : 'bg-white/[0.03] border-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isCurrent ? 'bg-amber-400 text-black shadow' : 'bg-white/[0.06] text-slate-300'}`}>
                                                            {dasha.lord.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                                {dasha.lord} Mahadasha
                                                                {isCurrent && <span className="text-[8px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-400/30 uppercase font-extrabold">Active</span>}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                {new Date(dasha.start).getFullYear()} – {new Date(dasha.end).getFullYear()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CosmicCard>
                            )}

                            {/* 6. YOGINI DASHA RESULT WITH POPUP & SHARE */}
                            {type === "yogini-dasha" && result?.list && (
                                <div className="space-y-4">
                                    <CosmicCard noHover className="p-5 space-y-4">
                                        <div className="text-center">
                                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Yogini Dasha (36 Years)</span>
                                            <h3 className="text-lg font-black text-white mt-0.5">8 Sacred Yogini Deities</h3>
                                            <p className="text-[10px] text-purple-200/70 mt-1">Tap the CURRENT period (or any period) to view in-depth summary, effects & remedies</p>
                                        </div>
                                        <div className="space-y-2">
                                            {result.list.map((y, idx) => {
                                                const isCurrent = new Date() >= new Date(y.start) && new Date() <= new Date(y.end);
                                                return (
                                                    <div 
                                                        key={idx}
                                                        onClick={() => setSelectedYogini(y)}
                                                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                                                            isCurrent 
                                                                ? 'bg-purple-600/30 border-purple-400/60 shadow-lg shadow-purple-500/15 hover:border-purple-300 ring-1 ring-purple-400/30' 
                                                                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-white">
                                                                    {y.name} ({y.lord})
                                                                </span>
                                                                {isCurrent && (
                                                                    <span className="text-[8px] bg-purple-400/25 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/40 uppercase font-black tracking-wider animate-pulse flex items-center gap-1">
                                                                        <Sparkles size={8} /> Current • Tap Summary
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                {y.start} to {y.end} ({y.duration} yrs)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${
                                                                isCurrent 
                                                                    ? 'bg-purple-400/20 text-purple-200 border-purple-400/40' 
                                                                    : 'bg-white/[0.04] text-slate-400 border-white/10'
                                                            }`}>
                                                                {isCurrent ? "Active" : `${y.duration}y`}
                                                            </span>
                                                            <Info size={14} className={isCurrent ? "text-purple-300" : "text-slate-500"} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CosmicCard>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer"
                                        >
                                            <RotateCcw size={14} /> Calculate Again
                                        </button>
                                        <button
                                            onClick={handleShareYoginiDasha}
                                            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
                                        >
                                            <Share2 size={14} /> Share Yogini Dasha
                                        </button>
                                    </div>

                                    {/* YOGINI DASHA SUMMARY POPUP MODAL */}
                                    <AnimatePresence>
                                        {selectedYogini && (
                                            <div 
                                                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                                                onClick={() => setSelectedYogini(null)}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    transition={{ duration: 0.2 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full max-w-md max-h-[88vh] overflow-y-auto bg-[#0d1020] border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative text-left space-y-4"
                                                >
                                                    {/* Close Button */}
                                                    <button
                                                        onClick={() => setSelectedYogini(null)}
                                                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                    {/* Header */}
                                                    <div className="flex items-center gap-3 pr-8">
                                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl text-purple-300 shadow">
                                                            <Sparkles size={22} className="text-purple-300" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-xl font-black text-white">
                                                                    {selectedYogini.name} Dasha
                                                                </h3>
                                                                {(() => {
                                                                    const isCur = new Date() >= new Date(selectedYogini.start) && new Date() <= new Date(selectedYogini.end);
                                                                    return isCur ? (
                                                                        <span className="text-[8px] bg-purple-400/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/40 uppercase font-black tracking-wider">
                                                                            Current
                                                                        </span>
                                                                    ) : null;
                                                                })()}
                                                            </div>
                                                            <span className="text-xs text-purple-200/80 font-semibold block">
                                                                Governed by {selectedYogini.lord} • {selectedYogini.duration} Years Cycle
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Date Span Badge */}
                                                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                                                        <div>
                                                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Period Duration</span>
                                                            <span className="font-extrabold text-white">{selectedYogini.start} to {selectedYogini.end}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                            {selectedYogini.duration} Years
                                                        </span>
                                                    </div>

                                                    {/* Nature & Key Themes */}
                                                    {(() => {
                                                        const info = YOGINI_DETAILS[selectedYogini.name] || {};
                                                        return (
                                                            <>
                                                                {/* Nature Pill */}
                                                                {info.nature && (
                                                                    <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border border-purple-400/20">
                                                                        <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider block">
                                                                            Cosmic Nature & Deity
                                                                        </span>
                                                                        <p className="text-xs font-bold text-white mt-0.5">
                                                                            {info.nature} • {info.deity || selectedYogini.lord}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Core Meaning & Summary */}
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[9px] text-purple-300 font-black uppercase tracking-wider block">
                                                                        Core Meaning & Influence
                                                                    </span>
                                                                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                                        {info.coreMeaning || "This Yogini period brings key karmic developments aligned with its planetary ruler."}
                                                                    </p>
                                                                </div>

                                                                {/* Key Manifestations */}
                                                                {info.effects && info.effects.length > 0 && (
                                                                    <div className="space-y-1.5">
                                                                        <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider block">
                                                                            Key Manifestations & Themes
                                                                        </span>
                                                                        <div className="grid grid-cols-1 gap-1.5">
                                                                            {info.effects.map((eff, i) => (
                                                                                <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                                                                                    <span className="text-purple-400 font-black">•</span>
                                                                                    <span>{eff}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Remedies */}
                                                                {info.remedies && (
                                                                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 space-y-1">
                                                                        <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                                                                            <Shield size={12} /> Spiritual Remedies & Best Practices
                                                                        </span>
                                                                        <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                                                                            {info.remedies}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}

                                                    {/* Sub-Periods (Antardashas) Preview if available */}
                                                    {selectedYogini.subPeriods && selectedYogini.subPeriods.length > 0 && (
                                                        <div className="space-y-2 pt-2 border-t border-white/10">
                                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">
                                                                Sub-Periods (Antardashas in {selectedYogini.name})
                                                            </span>
                                                            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                                                                {selectedYogini.subPeriods.map((sub, sIdx) => {
                                                                    const isSubCur = new Date() >= new Date(sub.start) && new Date() <= new Date(sub.end);
                                                                    return (
                                                                        <div 
                                                                            key={sIdx}
                                                                            className={`p-2 rounded-xl text-[10px] border ${
                                                                                isSubCur 
                                                                                    ? 'bg-purple-600/30 border-purple-400/50 text-white font-bold' 
                                                                                    : 'bg-white/[0.03] border-white/5 text-slate-300'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span>{sub.name}</span>
                                                                                {isSubCur && <span className="text-[8px] text-purple-300 font-black uppercase">Now</span>}
                                                                            </div>
                                                                            <span className="text-[9px] text-slate-400 block mt-0.5">{sub.start}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Modal Action Buttons */}
                                                    <div className="flex gap-2.5 pt-2">
                                                        <button
                                                            onClick={() => setSelectedYogini(null)}
                                                            className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer"
                                                        >
                                                            Close
                                                        </button>
                                                        <button
                                                            onClick={() => handleShareSpecificYogini(selectedYogini)}
                                                            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
                                                        >
                                                            <Share2 size={13} /> Share Period
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* 7. MOON SIGN / RASHI RESULT - FULL DETAILS & SHARE */}
                            {type === "moon-sign" && (result?.planets?.Moon || result?.moonSignName) && (() => {
                                const signIndex = (result.planets?.Moon?.sign || 1) - 1;
                                const moonSign = result.moonSignName || SIGNS[signIndex] || "Aries";
                                const moonLong = result.planets?.Moon?.longitude || 0;
                                const moonDeg = result.moonDeg || (moonLong % 30).toFixed(2);
                                const birthStar = result.nakshatraName || result.dashas?.birthNakshatra || result.panchang?.nakshatra || "-";

                                let pada = result.pada || result.charts?.D9?.Moon?.nakshatraPada || result.planets?.Moon?.nakshatraPada;
                                if (!pada && moonLong > 0) {
                                    const degInNak = moonLong % (40 / 3);
                                    pada = Math.floor(degInNak / (10 / 3)) + 1;
                                }
                                if (!pada || pada < 1 || pada > 4) pada = 1;

                                const rasiPada = result.rasiPada || Math.floor((moonLong % 30) / (10 / 3)) + 1;
                                const tithi = result.tithi || result.panchang?.tithi || "-";
                                const vara = result.vara || result.panchang?.vara || "-";
                                const relation = result.relation || result.planets?.Moon?.relation || "Neutral";

                                const rashiInfo = RASHI_DATA[moonSign] || {
                                    sanskrit: "Chandra Rashi",
                                    lord: "Moon",
                                    element: "Water",
                                    quality: "Chara (Movable)",
                                    symbol: "🌙",
                                    deity: "Lord Shiva",
                                    traits: "Your Moon sign reflects your inner emotions, instincts, intuitive intellect, and mental disposition."
                                };

                                const nakMeta = NAKSHATRA_DATA[birthStar] || {};
                                const nakLord = result.nakshatraLord || nakMeta.lord || "-";
                                const nakDeity = result.nakshatraDeity || nakMeta.deity || "-";

                                return (
                                    <div className="space-y-4">
                                        <CosmicCard noHover className="p-6 text-center space-y-4 relative overflow-hidden">
                                            {/* Glow Accent */}
                                            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                            {/* Zodiac Symbol */}
                                            <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-4xl mx-auto shadow-inner text-purple-300 drop-shadow-[0_2px_12px_rgba(168,85,247,0.5)]">
                                                {ZODIAC_SYMBOLS[moonSign] || "🌙"}
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.25em] block">
                                                    Your Vedic Moon Sign
                                                </span>
                                                <h2 className="text-3xl font-black text-white mt-1 tracking-tight">
                                                    {moonSign} Rashi
                                                </h2>
                                                {rashiInfo.sanskrit && (
                                                    <p className="text-xs font-semibold text-purple-200/80 mt-0.5">
                                                        {rashiInfo.sanskrit}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/25 text-purple-200 border border-purple-500/40 shadow-sm">
                                                        <Star size={12} className="text-amber-300" fill="currentColor" />
                                                        {birthStar} • Pada {pada}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.06] text-slate-300 border border-white/10">
                                                        Rasi Paada {rasiPada} of 9
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Astrological Identity Grid (Matching Web!) */}
                                            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-left space-y-3 mt-4">
                                                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                                    <Sparkles size={14} className="text-purple-300" />
                                                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                                        Astrological Identity & Panchang
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moon Sign (Rashi)</p>
                                                        <p className="text-xs font-extrabold text-purple-300 mt-0.5">{moonSign} Rashi</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Star (Nakshatra)</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{birthStar}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rasi Paada (Charan)</p>
                                                        <p className="text-xs font-extrabold text-amber-300 mt-0.5">Pada {pada}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moon Celestial Degree</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{moonDeg}°</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rashi Lord (Ruling Planet)</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{rashiInfo.lord}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Elemental Tattva</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{rashiInfo.element}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sign Nature / Quality</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{rashiInfo.quality}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moon Dignity (Status)</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{relation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Tithi</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{tithi}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Vara (Day)</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{vara}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nakshatra Lord</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{nakLord}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Presiding Deity</p>
                                                        <p className="text-xs font-extrabold text-white mt-0.5">{nakDeity}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Emotional Nature & Mind Profile Card */}
                                            <div className="bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-transparent border border-purple-500/20 rounded-2xl p-4 text-left space-y-1.5">
                                                <span className="text-[9px] font-black uppercase text-purple-300 tracking-wider">
                                                    Emotional Nature & Mind Profile
                                                </span>
                                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                    {rashiInfo.traits}
                                                </p>
                                            </div>
                                        </CosmicCard>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2.5">
                                            <button
                                                onClick={() => setResult(null)}
                                                className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer"
                                            >
                                                <RotateCcw size={14} /> Calculate Again
                                            </button>
                                            <button
                                                onClick={handleShareMoonSign}
                                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
                                            >
                                                <Share2 size={14} /> Share Rashi
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 8. NUMEROLOGY RESULT */}
                            {type === "numerology" && result?.lifePath && (
                                <CosmicCard noHover className="p-6 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl font-black text-emerald-300 mx-auto">
                                        #{result.lifePath}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest">Life Path Number</span>
                                        <h2 className="text-2xl font-black text-white mt-1">Path Number {result.lifePath}</h2>
                                        <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                                            Represents the path you are walking in this lifetime, uncovering key lessons, opportunities, and inner challenges.
                                        </p>
                                    </div>
                                    {result.destinyNumber && (
                                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Destiny (Expression) Number</span>
                                            <span className="text-base font-black text-amber-300 block mt-0.5">#{result.destinyNumber}</span>
                                        </div>
                                    )}
                                </CosmicCard>
                            )}

                            {/* 9. SUN SIGN RESULT */}
                            {type === "sun-sign" && result?.sign && (
                                <CosmicCard noHover className="p-6 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner text-amber-300">
                                        {ZODIAC_SYMBOLS[result.sign] || "☀️"}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">Your Sun Sign</span>
                                        <h2 className="text-3xl font-black text-white mt-1">{result.sign}</h2>
                                        <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                                            Your core ego, creative life force, and solar identity shining upon your consciousness.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Element</span>
                                            <span className="text-xs font-bold text-white block mt-0.5">{result.element}</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Ruling Planet</span>
                                            <span className="text-xs font-bold text-white block mt-0.5">{result.ruler}</span>
                                        </div>
                                    </div>
                                </CosmicCard>
                            )}

                            {/* 10. FRIENDSHIP RESULT */}
                            {type === "friendship" && result?.score !== undefined && (
                                <CosmicCard noHover className="p-6 text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-400/40 flex flex-col items-center justify-center mx-auto">
                                        <span className="text-2xl font-black text-white">{result.score}%</span>
                                        <span className="text-[8px] font-bold text-blue-300 uppercase">Bond</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-widest">Friendship Synergy</span>
                                        <h3 className="text-xl font-black text-white mt-1">{result.friend1} & {result.friend2}</h3>
                                        <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                                            A supportive and dependable connection built on mutual respect and positive shared energy.
                                        </p>
                                    </div>
                                </CosmicCard>
                            )}

                            {/* 11. ZODIAC COMPATIBILITY RESULT */}
                            {type === "zodiac-compatibility" && result?.score !== undefined && (
                                <CosmicCard noHover className="p-6 text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-orange-500/20 border border-orange-400/40 flex flex-col items-center justify-center mx-auto">
                                        <span className="text-2xl font-black text-white">{result.score}%</span>
                                        <span className="text-[8px] font-bold text-orange-300 uppercase">{result.harmony}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-widest">Zodiac Compatibility</span>
                                        <h3 className="text-xl font-black text-white mt-1">{result.sign1} + {result.sign2}</h3>
                                        <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                                            High natural attraction and complementary elements. You bring out dynamic strengths in each other.
                                        </p>
                                    </div>
                                </CosmicCard>
                            )}

                            {/* 12. MARRIAGE & CAREER TIMING RESULT */}
                            {type === "marriage-career" && result && (
                                <div className="space-y-4">
                                    {/* Astrological Identity Banner (7th Lord & 10th Lord) */}
                                    <CosmicCard noHover className="p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                                                    <Sparkles size={16} />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                                                        Astrological Significators
                                                    </span>
                                                    <h3 className="text-sm font-black text-white">
                                                        Ruling House Lords & Karakas
                                                    </h3>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                                D1 & Vimshottari
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                                <div className="flex items-center gap-1.5 text-rose-300 mb-0.5">
                                                    <Heart size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-wider">7th Lord (Marriage)</span>
                                                </div>
                                                <p className="text-sm font-black text-white">
                                                    {result.meta?.seventhLord || "Venus"}
                                                </p>
                                                <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                                                    Significators: {result.meta?.marriageKarakas?.join(", ") || "Venus, 7th Lord"}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                <div className="flex items-center gap-1.5 text-blue-300 mb-0.5">
                                                    <Briefcase size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-wider">10th Lord (Career)</span>
                                                </div>
                                                <p className="text-sm font-black text-white">
                                                    {result.meta?.tenthLord || "Sun"}
                                                </p>
                                                <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                                                    Significators: {result.meta?.careerKarakas?.join(", ") || "Sun, Saturn, 10th Lord"}
                                                </span>
                                            </div>
                                        </div>
                                    </CosmicCard>

                                    {/* Tabs for Marriage and Career Favorables */}
                                    <div className="flex p-1.5 bg-white/[0.06] rounded-2xl border border-white/10 gap-1.5">
                                        <button
                                            onClick={() => setTimingTab("marriage")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                timingTab === "marriage"
                                                    ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400/50"
                                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            <Heart size={14} className={timingTab === "marriage" ? "text-white fill-white/20" : "text-rose-400"} />
                                            <span>Marriage ({result.marriage?.length || 0})</span>
                                        </button>
                                        <button
                                            onClick={() => setTimingTab("career")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                timingTab === "career"
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50"
                                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            <Briefcase size={14} className={timingTab === "career" ? "text-white" : "text-blue-400"} />
                                            <span>Career ({result.career?.length || 0})</span>
                                        </button>
                                    </div>

                                    {/* Tab Content Header / Explanatory Note */}
                                    <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                                        timingTab === "marriage"
                                            ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                                            : "bg-blue-500/10 border-blue-500/20 text-blue-200"
                                    }`}>
                                        <p className="font-medium text-[11px]">
                                            {timingTab === "marriage" 
                                                ? "Favorable marriage periods calculated through the 7th house lord, natural significators (Venus/Jupiter), and Vimshottari Mahadasha/Antardasha alignments."
                                                : "Professional expansion and promotion windows calculated through the 10th house lord, career karakas (Sun, Saturn, Mercury), and supporting dasha transits."
                                            }
                                        </p>
                                    </div>

                                    {/* Favorable Periods List */}
                                    <CosmicCard noHover className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {timingTab === "marriage" ? (
                                                    <Heart size={16} className="text-rose-400" />
                                                ) : (
                                                    <Briefcase size={16} className="text-blue-400" />
                                                )}
                                                <h3 className="text-sm font-black text-white">
                                                    {timingTab === "marriage" ? "Auspicious Marriage Windows" : "Favorable Career Windows"}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] font-extrabold text-slate-400">
                                                {timingTab === "marriage" 
                                                    ? `${result.marriage?.length || 0} Periods` 
                                                    : `${result.career?.length || 0} Periods`}
                                            </span>
                                        </div>

                                        {(() => {
                                            const periods = (timingTab === "marriage" ? result.marriage : result.career) || [];
                                            const displayedPeriods = showAllTimings ? periods : periods.slice(0, 6);

                                            if (periods.length === 0) {
                                                return (
                                                    <div className="py-8 text-center text-slate-400 text-xs">
                                                        No specific favorable periods identified in this dasha cycle.
                                                    </div>
                                                );
                                            }

                                            const now = new Date();

                                            return (
                                                <div className="space-y-2.5">
                                                    {displayedPeriods.map((p, idx) => {
                                                        const isCurrent = now >= new Date(p.start) && now <= new Date(p.end);
                                                        const isVeryHigh = p.strength === "Very High";

                                                        return (
                                                            <div 
                                                                key={idx} 
                                                                className={`p-3.5 rounded-2xl border transition-all ${
                                                                    isCurrent
                                                                        ? "bg-purple-600/20 border-purple-400/50 shadow-md shadow-purple-500/10 ring-1 ring-purple-400/30"
                                                                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 text-xs font-bold">
                                                                                {p.mahadasha}
                                                                            </span>
                                                                            <span className="text-slate-400 text-xs">/</span>
                                                                            <span className="px-2 py-0.5 rounded-md bg-purple-500/25 border border-purple-500/40 text-purple-200 text-xs font-bold">
                                                                                {p.antardasha}
                                                                            </span>
                                                                            {isCurrent && (
                                                                                <span className="bg-purple-400/25 text-purple-200 border border-purple-400/40 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                                                                                    <Sparkles size={8} /> Active Now
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5 font-medium">
                                                                            <Calendar size={11} className="text-slate-500" />
                                                                            <span>{p.start} to {p.end}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                                                        isVeryHigh 
                                                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                                                                            : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                                                    }`}>
                                                                        {p.strength} Favorability
                                                                    </span>
                                                                </div>

                                                                {p.reason && (
                                                                    <div className="mt-2 pt-2 border-t border-white/5 flex items-start gap-1.5">
                                                                        <Info size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                                                        <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                                                                            {p.reason}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {periods.length > 6 && (
                                                        <button
                                                            onClick={() => setShowAllTimings(!showAllTimings)}
                                                            className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
                                                        >
                                                            {showAllTimings ? "Show Less" : `View All ${periods.length} Favorable Windows`}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </CosmicCard>

                                    {/* Action Buttons: Calculate Again & Share */}
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer"
                                        >
                                            <RotateCcw size={14} /> Calculate Again
                                        </button>
                                        <button
                                            onClick={handleShareTiming}
                                            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
                                        >
                                            <Share2 size={14} /> Share Timings
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Recalculate Button for other calculators */}
                            {type !== "ascendant" && type !== "nakshatra" && type !== "moon-sign" && type !== "atmakaraka" && type !== "yogini-dasha" && type !== "marriage-career" && (
                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                                >
                                    <RotateCcw size={14} /> Calculate Again / Change Details
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
