import { Suspense } from "react";
import KundliResultContent from "./KundliResultClient";
import CosmicLoader from "@/components/CosmicLoader";

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader size="lg" message="Aligning the Stars..." />}>
            <KundliResultContent />
        </Suspense>
    );
}
