"use client";

import { initCanvas } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas({
  socket,
  roomId,
}: {
  socket: WebSocket;
  roomId: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      initCanvas(roomId, canvasRef.current, socket);
    }
  }, [canvasRef]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="bg-black/90 h-screen w-screen"
      ></canvas>
    </div>
  );
}
