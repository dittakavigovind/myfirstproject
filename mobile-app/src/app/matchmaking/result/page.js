import { Suspense } from "react";
import MatchmakingResultContent from "./MatchmakingResultClient";
import CosmicLoader from "@/components/CosmicLoader";

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader size="lg" message="Aligning your Souls..." />}>
            <MatchmakingResultContent />
        </Suspense>
    );
}
