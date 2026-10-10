"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CosmicLoader from "@/components/CosmicLoader";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/explore");
    }, [router]);

    return <CosmicLoader message="Connecting Call..." />;
}
