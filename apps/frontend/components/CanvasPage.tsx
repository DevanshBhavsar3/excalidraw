"use client";

import { Canvas } from "./Canvas";
import { useSocket } from "@/hooks/useSocket";

export function CanvasPage({ roomId }: { roomId: number }) {
  const { loading, socket } = useSocket(roomId);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!socket) {
    return <div>Socket connection failed.</div>;
  }

  return (
    <div>
      <Canvas socket={socket} roomId={roomId} />
    </div>
  );
}
