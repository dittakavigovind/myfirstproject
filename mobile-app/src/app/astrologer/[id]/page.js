import AstrologerProfileClient from "./AstrologerProfileClient";

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function Page({ params }) {
    return <AstrologerProfileClient params={params} />;
}
