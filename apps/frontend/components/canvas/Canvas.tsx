"use client";

import { Game } from "@/draw/Game";
import { ShapeConfig, State, Tools } from "@/types";
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
import { MdRectangle } from "react-icons/md";
import { CgShapeZigzag } from "react-icons/cg";
import { CgViewMonth } from "react-icons/cg";
import { TfiLineDashed } from "react-icons/tfi";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Link from "next/link";

export function Canvas({
  socket,
  roomId,
}: {
  socket: WebSocket;
  roomId: number;
}) {
  const [game, setGame] = useState<Game>();
  const [currentState, setCurrentState] = useState<State>({
    tool: Tools.Cursor,
    scale: 1,
    config: {
      roughness: 1,
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 1,
      fillStyle: "solid",
    },
    showDelete: false,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const didInit = useRef<boolean>(false);

  useEffect(() => {
    if (canvasRef.current && !didInit.current) {
      const game = new Game(canvasRef.current, roomId, socket, setCurrentState);

      setGame(game);
      didInit.current = true;

      return () => {
        game.destroy();
      };
    }
  }, [canvasRef, game]);

  function changeTool(tool: Tools) {
    if (game) {
      game.setTool(tool);
    }
  }

  function changeConfig<T extends keyof ShapeConfig>(
    type: T,
    value: ShapeConfig[T]
  ) {
    if (!game) return;

    game.shapeConfig[type] = value;
    setCurrentState((prevState) => ({
      ...prevState,
      [prevState.config[type]]: value,
    }));
  }

  const tools = [
    { icon: <FaRegHandPaper size={18} />, type: Tools.Hand },
    { icon: <RxCursorArrow size={18} />, type: Tools.Cursor },
    { icon: <BiRectangle size={18} />, type: Tools.Rectangle },
    { icon: <BiCircle size={18} />, type: Tools.Circle },
    { icon: <TfiLayoutLineSolid size={18} />, type: Tools.Line },
    { icon: <BiPencil size={18} />, type: Tools.Pencil },
  ];

  const fillStyles = [
    {
      icon: <MdRectangle size={18} />,
      type: "solid" as const,
    },
    {
      icon: <CgShapeZigzag size={18} />,
      type: "zigzag" as const,
    },
    {
      icon: <CgViewMonth size={18} />,
      type: "cross-hatch" as const,
    },
    {
      icon: <TfiLineDashed size={18} />,
      type: "dashed" as const,
    },
  ];

  return (
    <div>
      <Link
        href={"/dashboard"}
        className="fixed top-5 left-5 p-1 border border-primary hover:bg-primary rounded-md flex justify-center items-center hover:text-white cursor-pointer transition-all"
      >
        <MdOutlineKeyboardArrowLeft size={24} />
      </Link>
      <canvas ref={canvasRef} className="h-screen w-screen"></canvas>
      {/* Config options */}
      {currentState?.tool !== Tools.Cursor &&
        currentState?.tool !== Tools.Hand &&
        currentState?.tool !== Tools.Pencil && (
          <div className="z-10 absolute left-5 px-4 py-2 top-1/2 -translate-y-1/2 bg-white border border-primary flex flex-col gap-3 rounded-md">
            <div>
              <p className="text-sm font-medium">
                Roughness: {currentState.config.roughness}
              </p>
              <input
                type="range"
                min={0}
                max={5}
                value={currentState.config.roughness}
                onChange={(e) => {
                  changeConfig("roughness", Number(e.target.value));
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Fill</p>
              <input
                type="color"
                value={currentState.config.fill}
                onChange={(e) => {
                  if (e.target.value === "#ffffff") {
                    changeConfig("fill", "rgba(0,0,0,0)");
                  } else {
                    changeConfig("fill", e.target.value);
                  }
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Stroke</p>
              <input
                type="color"
                value={currentState.config.stroke}
                onChange={(e) => {
                  changeConfig("stroke", e.target.value);
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                Stroke width: {currentState.config.strokeWidth}
              </p>
              <input
                type="range"
                min={1}
                max={10}
                value={currentState.config.strokeWidth}
                onChange={(e) => {
                  changeConfig("strokeWidth", Number(e.target.value));
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Fill Style</p>
              <div className="flex flex-wrap justify-center items-center gap-1 ">
                {fillStyles.map((fillStyle) => (
                  <ToolbarButton
                    key={fillStyle.type}
                    onClick={() => changeConfig("fillStyle", fillStyle.type)}
                    isSelected={
                      fillStyle.type === currentState.config.fillStyle
                    }
                  >
                    {fillStyle.icon}
                  </ToolbarButton>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Toolbar */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-white border-2 border-primary/50 p-1 rounded-md flex justify-center items-center gap-1">
        {tools.map((tool) => (
          <ToolbarButton
            key={tool.type}
            onClick={() => changeTool(tool.type)}
            isSelected={tool.type === currentState?.tool}
          >
            {tool.icon}
          </ToolbarButton>
        ))}
        {currentState.showDelete && (
          <ToolbarButton onClick={() => game?.deleteShape()}>
            <AiTwotoneDelete size={18} />
          </ToolbarButton>
        )}
      </div>

      {/* Scale options */}
      <div className="fixed bottom-5 left-5 bg-white border border-black/10 rounded-md flex justify-center items-center">
        <button
          onClick={() => game?.zoom(0.1)}
          className="p-1 hover:bg-primary/30 rounded-l-md border-r"
        >
          <BiMinus size={24} />
        </button>
        <button
          className="px-10 py-1 hover:bg-primary/30"
          onClick={() => game?.resetScale()}
        >
          {Math.floor(currentState?.scale * 100)}%
        </button>
        <button
          onClick={() => game?.zoom(-0.1)}
          className="p-1 hover:bg-primary/30 rounded-r-md border-l"
        >
          <BiPlus size={24} />
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  isSelected,
  onClick,
}: {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${isSelected ? "bg-primary text-white" : "hover:bg-primary/30"} p-2 rounded-md `}
    >
      {children}
    </button>
  );
}
