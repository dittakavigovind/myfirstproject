"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CosmicLoader from "@/components/CosmicLoader";

function CallRoomRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            window.dispatchEvent(new CustomEvent('start-global-call', { detail: { roomId: id } }));
        }
        router.replace("/explore");
    }, [router, searchParams]);

    return <CosmicLoader message="Connecting Call..." />;
}

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader message="Connecting Call..." />}>
            <CallRoomRedirect />
        </Suspense>
    );
}
