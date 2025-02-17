import { CanvasPage } from "@/components/CanvasPage";

export default async function Page({ params }: { params: { roomId: number } }) {
  const roomId = (await params).roomId;
  return <CanvasPage roomId={roomId} />;
}
