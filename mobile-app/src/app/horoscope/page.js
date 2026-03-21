import { Suspense } from "react";
import HoroscopeDetailContent from "./HoroscopeDetailClient";
import CosmicLoader from "@/components/CosmicLoader";

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader size="lg" message="Reading the stars..." />}>
            <HoroscopeDetailContent />
        </Suspense>
    );
}
