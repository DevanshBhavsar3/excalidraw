import { BACKEND_URL } from "@/app/config";
import axios from "axios";

type Shape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function initCanvas(
  roomId: number,
  canvas: HTMLCanvasElement,
  socket: WebSocket
) {
  const shapes: Shape[] = await getShapes(roomId);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = "#FFFFFF";

  let startCoordinates = { x: 0, y: 0 };
  let width: number = 0;
  let height: number = 0;
  let isDrawing = false;

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const newShape = JSON.parse(data.message);
    shapes.push(newShape);
    clearCanvas(canvas, ctx, shapes);
  };

  clearCanvas(canvas, ctx, shapes);

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    startCoordinates.x = e.clientX;
    startCoordinates.y = e.clientY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      width = e.clientX - startCoordinates.x;
      height = e.clientY - startCoordinates.y;

      clearCanvas(canvas, ctx, shapes);
      ctx.strokeRect(startCoordinates.x, startCoordinates.y, width, height);
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    isDrawing = false;
    const newShape: Shape = {
      type: "rect",
      x: startCoordinates.x,
      y: startCoordinates.y,
      width,
      height,
    };
    shapes.push(newShape);

    socket.send(
      JSON.stringify({
        type: "CHAT",
        roomId: Number(roomId),
        message: JSON.stringify(newShape),
      })
    );
  });
}

function clearCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  shapes: Shape[]
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShapes(ctx, shapes);
}

function drawShapes(ctx: CanvasRenderingContext2D, shapes: Shape[]) {
  console.log(shapes);
  shapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getShapes(roomId: number) {
  const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });

  const shapes = response.data.chats.map((chat: { message: string }) =>
    JSON.parse(chat.message)
  );

  return shapes;
}
