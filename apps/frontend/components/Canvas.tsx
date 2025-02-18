"use client";

import { initCanvas } from "@/draw";
import { ConfigType } from "@/types";
import { useEffect, useRef } from "react";
import { BiRectangle, BiCircle } from "react-icons/bi";
import { RxCursorArrow } from "react-icons/rx";
import { TfiLayoutLineSolid } from "react-icons/tfi";

export function Canvas({
  socket,
  roomId,
}: {
  socket: WebSocket;
  roomId: number;
}) {
  const configRef = useRef<ConfigType>({
    currentTool: "cursor",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const didInit = useRef<boolean>(false);

  useEffect(() => {
    if (canvasRef.current && !didInit.current) {
      initCanvas(roomId, canvasRef.current, socket, configRef.current);
      didInit.current = true;
    }
  }, [canvasRef]);

  return (
    <div>
      <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
      <div className="fixed top-5 left-1/2 bg-white text-black">
        <button onClick={() => (configRef.current.currentTool = "cursor")}>
          <RxCursorArrow size={24} />
        </button>
        <button onClick={() => (configRef.current.currentTool = "rect")}>
          <BiRectangle size={24} />
        </button>
        <button onClick={() => (configRef.current.currentTool = "circle")}>
          <BiCircle size={24} />
        </button>
        <button onClick={() => (configRef.current.currentTool = "line")}>
          <TfiLayoutLineSolid size={24} />
        </button>
      </div>
    </div>
  );
}
