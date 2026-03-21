import ChatRoomClient from "./ChatRoomClient";

export function generateStaticParams() {
    return [{ id: '1' }];
}

export default function Page({ params }) {
    return <ChatRoomClient params={params} />;
}
