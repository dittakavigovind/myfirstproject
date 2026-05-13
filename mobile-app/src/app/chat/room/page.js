import { Suspense } from "react";
import ChatRoomClient from "./ChatRoomClient";
import CosmicLoader from "@/components/CosmicLoader";

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader message="Connecting to Chat..." />}>
            <ChatRoomClient />
        </Suspense>
    );
}
