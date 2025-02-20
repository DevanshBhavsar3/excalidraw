import { CanvasPage } from "@/components/CanvasPage";

export default async function Page({ params }: { params: { roomId: string } }) {
  const roomId = Number((await params).roomId);
  return <CanvasPage roomId={roomId} />;
}
