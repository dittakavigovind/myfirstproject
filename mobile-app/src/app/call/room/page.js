import { Suspense } from "react";
import CallRoomClient from "./CallRoomClient";
import CosmicLoader from "@/components/CosmicLoader";

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader message="Connecting Call..." />}>
            <CallRoomClient />
        </Suspense>
    );
}
