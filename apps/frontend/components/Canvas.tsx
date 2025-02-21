"use client";

import { Game } from "@/draw/Game";
import { Tools } from "@/types";
import { useEffect, useRef, useState } from "react";
import {
  BiRectangle,
  BiCircle,
  BiPencil,
  BiPlus,
  BiMinus,
} from "react-icons/bi";
import { RxCursorArrow } from "react-icons/rx";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaRegHandPaper } from "react-icons/fa";

export function Canvas({
  socket,
  roomId,
}: {
  socket: WebSocket;
  roomId: number;
}) {
  const [game, setGame] = useState<Game>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const didInit = useRef<boolean>(false);

  useEffect(() => {
    if (canvasRef.current && !didInit.current) {
      const game = new Game(canvasRef.current, roomId, socket);

      setGame(game);
      didInit.current = true;

      return () => {
        game.destroy();
      };
    }
  }, [canvasRef, game]);

  return (
    <div>
      <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
      <div className="fixed top-5 left-1/2 bg-white text-black">
        <button onClick={() => game?.setTool(Tools.Hand)}>
          <FaRegHandPaper size={24} />
        </button>
        <button onClick={() => game?.setTool(Tools.Cursor)}>
          <RxCursorArrow size={24} />
        </button>
        <button onClick={() => game?.setTool(Tools.Rectangle)}>
          <BiRectangle size={24} />
        </button>
        <button onClick={() => game?.setTool(Tools.Circle)}>
          <BiCircle size={24} />
        </button>
        <button onClick={() => game?.setTool(Tools.Line)}>
          <TfiLayoutLineSolid size={24} />
        </button>
        <button onClick={() => game?.setTool(Tools.Pencil)}>
          <BiPencil size={24} />
        </button>
        <button onClick={() => game?.deleteShape()}>
          <AiTwotoneDelete size={24} />
        </button>
        {/* <button onClick={() => game?.zoom(0.1)}>
          <BiPlus size={24} />
        </button>
        <button onClick={() => game?.zoom(-0.1)}>
          <BiMinus size={24} />
        </button> */}
      </div>
    </div>
  );
}
