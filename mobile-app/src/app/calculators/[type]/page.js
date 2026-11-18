import CalculatorClient from "./CalculatorClient";

// Static pre-rendering for Capacitor Static Export
export function generateStaticParams() {
    return [
        { type: "ashtakavarga" },
        { type: "dasha-periods" },
        { type: "dasha" },
        { type: "yogini-dasha" },
        { type: "atmakaraka" },
        { type: "gochar" },
        { type: "transit" },
        { type: "moon-sign" },
        { type: "moon-sign-calculator" },
        { type: "sun-sign" },
        { type: "sun-sign-calculator" },
        { type: "nakshatra" },
        { type: "nakshatra-calculator" },
        { type: "ascendant" },
        { type: "ascendant-calculator" },
        { type: "numerology" },
        { type: "numerology-calculator" },
        { type: "friendship" },
        { type: "friendship-calculator" },
        { type: "marriage-career" },
        { type: "marriage-&-career" },
        { type: "hora-muhurat" },
        { type: "today-hora-muhurat" },
        { type: "choghadiya" },
        { type: "today-choghadiya-muhurat" },
        { type: "zodiac-compatibility" },
        { type: "compatability" },
        { type: "sade-sati-calculator" }
    ];
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    return <CalculatorClient type={resolvedParams?.type} />;
}
