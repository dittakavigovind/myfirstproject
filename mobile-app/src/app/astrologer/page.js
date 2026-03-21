"use client";

import { useSearchParams } from "next/navigation";
import AstrologerProfileClient from "./AstrologerProfileClient";
import { Suspense } from "react";
import CosmicLoader from "@/components/CosmicLoader";

function AstrologerProfileContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    
    return <AstrologerProfileClient id={id} />;
}

export default function Page() {
    return (
        <Suspense fallback={<CosmicLoader message="Loading Profile..." />}>
            <AstrologerProfileContent />
        </Suspense>
    );
}
