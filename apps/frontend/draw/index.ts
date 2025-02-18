import { BACKEND_URL } from "@/app/config";
import { ConfigType, Rectangle, ResizeHandle, Shape } from "@/types";
import axios from "axios";

export async function initCanvas(
  roomId: number,
  canvas: HTMLCanvasElement,
  socket: WebSocket,
  configuration: ConfigType
) {
  const shapes: Shape[] = await getShapes(roomId);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cursor = "default";

  let startCoordinates = { x: 0, y: 0 };
  let width: number = 0;
  let height: number = 0;
  let radius: number = 0;
  let isDrawing = false;
  let selectedShape: Shape | null = null;
  let isResizing = false;
  let activeHandle: ResizeHandle | null = null;

  clearCanvas(canvas, ctx, shapes, selectedShape);
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const newShape = JSON.parse(data.message);
    shapes.push(newShape);
    clearCanvas(canvas, ctx, shapes, selectedShape);
  };

  canvas.addEventListener("mousedown", (e) => {
    if (configuration.currentTool === "cursor" && selectedShape) {
      const handles = getResizeHandles(selectedShape);
      if (!handles) return;
      const mousePos = { x: e.clientX, y: e.clientY };
      const overHandle = handles.find((handle) =>
        isOverResizeHandle(mousePos, handle)
      );

      if (overHandle) {
        isResizing = true;
        activeHandle = overHandle;
      }
    } else {
      isDrawing = true;
      startCoordinates.x = e.clientX;
      startCoordinates.y = e.clientY;
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (selectedShape && configuration.currentTool === "cursor") {
      const handles = getResizeHandles(selectedShape);
      const mousePos = { x: e.clientX, y: e.clientY };
      if (!handles) return;

      // Change cursor when over handles
      const overHandle = handles.find((handle) =>
        isOverResizeHandle(mousePos, handle)
      );
      if (overHandle) {
        canvas.style.cursor = overHandle.cursor;
      } else {
        canvas.style.cursor = "default";
      }

      if (isResizing && activeHandle) {
        switch (selectedShape.kind) {
          case "rect":
            switch (activeHandle.position) {
              case "full":
                selectedShape.x = e.clientX;
                selectedShape.y = e.clientY;
                break;
              case "bottom-right":
                selectedShape.width = e.clientX - selectedShape.x;
                selectedShape.height = e.clientY - selectedShape.y;
                break;
              case "top-left":
                const newWidth =
                  selectedShape.width + (selectedShape.x - e.clientX);
                const newHeight =
                  selectedShape.height + (selectedShape.y - e.clientY);
                selectedShape.x = e.clientX;
                selectedShape.y = e.clientY;
                selectedShape.width = newWidth;
                selectedShape.height = newHeight;
                break;
              case "top-right":
                const oldBottom = selectedShape.y + selectedShape.height;
                selectedShape.width = e.clientX - selectedShape.x;
                selectedShape.y = e.clientY;
                selectedShape.height = oldBottom - e.clientY;
                break;
              case "bottom-left":
                const oldRight = selectedShape.x + selectedShape.width;
                selectedShape.height = e.clientY - selectedShape.y;
                selectedShape.x = e.clientX;
                selectedShape.width = oldRight - e.clientX;
                break;
            }
            break;
          case "circle":
            switch (activeHandle.position) {
              case "full":
                selectedShape.x = e.clientX;
                selectedShape.y = e.clientY;
                break;
              case "bottom-right":
              case "top-left":
              case "top-right":
              case "bottom-left":
                selectedShape.radius = Math.floor(
                  Math.abs(e.clientY - startCoordinates.y)
                );
                break;
            }
          case "line":
        }

        clearCanvas(canvas, ctx, shapes, selectedShape);
        drawResizeHandles(ctx, selectedShape);
      }
    }
    if (isDrawing) {
      clearCanvas(canvas, ctx, shapes, selectedShape);

      switch (configuration.currentTool) {
        case "rect":
          width = e.clientX - startCoordinates.x;
          height = e.clientY - startCoordinates.y;
          ctx.strokeRect(startCoordinates.x, startCoordinates.y, width, height);
          break;
        case "circle":
          radius = Math.floor(Math.abs(e.clientY - startCoordinates.y));

          ctx.beginPath();
          ctx.arc(
            startCoordinates.x,
            startCoordinates.y,
            radius,
            0,
            2 * Math.PI
          );
          ctx.stroke();
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(startCoordinates.x, startCoordinates.y);
          ctx.lineTo(e.clientX, e.clientY);
          ctx.stroke();
        default:
          return;
      }
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (isResizing && selectedShape) {
      isResizing = false;
      activeHandle = null;
      // Update the shape in your shapes array
      const shapeIndex = shapes.findIndex((s) => s === selectedShape);
      if (shapeIndex !== -1) {
        shapes[shapeIndex] = selectedShape;
        socket.send(
          JSON.stringify({
            type: "UPDATE_SHAPE",
            roomId: Number(roomId),
            message: JSON.stringify(selectedShape),
          })
        );
      }
      selectedShape = null;
    }

    if (isDrawing) {
      isDrawing = false;
      selectedShape = null;
      let newShape: Shape;

      switch (configuration.currentTool) {
        case "rect":
          newShape = {
            kind: "rect",
            x: startCoordinates.x,
            y: startCoordinates.y,
            width,
            height,
          };
          break;
        case "circle":
          newShape = {
            kind: "circle",
            x: startCoordinates.x,
            y: startCoordinates.y,
            radius,
          };
          break;
        case "line":
          newShape = {
            kind: "line",
            startX: startCoordinates.x,
            startY: startCoordinates.y,
            endX: e.clientX,
            endY: e.clientY,
          };
          break;
        default:
          return;
      }

      socket.send(
        JSON.stringify({
          type: "CHAT",
          roomId: Number(roomId),
          message: JSON.stringify(newShape),
        })
      );
    }
  });

  canvas.addEventListener("click", (e) => {
    if (configuration.currentTool === "cursor") {
      let isFound = false;
      shapes.forEach((shape) => {
        if (!isFound) {
          selectedShape = getSelectedShape(shape, {
            x: e.clientX,
            y: e.clientY,
          });

          if (selectedShape) {
            isFound = true;
          }
        }

        if (selectedShape) {
          // ctx.strokeRect(
          //   selectedShape.x,
          //   selectedShape.y,
          //   selectedShape.width,
          //   selectedShape.height
          // );

          drawResizeHandles(ctx, selectedShape);
        } else {
          selectedShape = null;
          clearCanvas(canvas, ctx, shapes, selectedShape);
        }
      });
    }
  });
}

function clearCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  selectedShape: Shape | null
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShapes(ctx, shapes, selectedShape);
}

function drawShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  selectedShape: Shape | null
) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  shapes.forEach((shape) => {
    switch (shape.kind) {
      case "rect":
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
      default:
        return;
    }
    if (selectedShape === shape && shape.kind === "rect") {
      drawResizeHandles(ctx, shape);
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

function getSelectedShape(shape: Shape, currentPos: { x: number; y: number }) {
  switch (shape.kind) {
    case "rect":
      const shapeBoundingWidth = shape.x + shape.width;
      const shapeBoundingHeight = shape.y + shape.height;

      if (
        shapeBoundingWidth > currentPos.x &&
        shapeBoundingHeight > currentPos.y &&
        shape.x < currentPos.x &&
        shape.y < currentPos.y
      ) {
        return shape;
      }
      break;
    case "circle":
      const distance = Math.sqrt(
        Math.pow(currentPos.x - shape.x, 2) +
          Math.pow(currentPos.y - shape.y, 2)
      );

      if (distance < shape.radius) {
        return shape;
      }
      break;
    case "line":
      break;
    default:
      return null;
  }

  return null;
}

function getResizeHandles(shape: Shape): ResizeHandle[] | null {
  switch (shape.kind) {
    case "rect":
      return [
        {
          x: shape.x + 8,
          y: shape.y + 8,
          cursor: "move",
          position: "full",
          width: shape.width,
          height: shape.height,
        },
        {
          x: shape.x,
          y: shape.y,
          cursor: "nw-resize",
          position: "top-left",
          width: 16,
          height: 16,
        },
        {
          x: shape.x + shape.width,
          y: shape.y,
          cursor: "ne-resize",
          position: "top-right",
          width: 16,
          height: 16,
        },
        {
          x: shape.x,
          y: shape.y + shape.height,
          cursor: "sw-resize",
          position: "bottom-left",
          width: 16,
          height: 16,
        },
        {
          x: shape.x + shape.width,
          y: shape.y + shape.height,
          cursor: "se-resize",
          position: "bottom-right",
          width: 16,
          height: 16,
        },
      ];
    case "circle":
      return [
        {
          x: shape.x - shape.radius + 8,
          y: shape.y - shape.radius + 8,
          cursor: "move",
          position: "full",
          width: 2 * shape.radius,
          height: 2 * shape.radius,
        },
        {
          x: shape.x - shape.radius,
          y: shape.y - shape.radius,
          cursor: "nw-resize",
          position: "top-left",
          width: 16,
          height: 16,
        },
        {
          x: shape.x + shape.radius,
          y: shape.y - shape.radius,
          cursor: "ne-resize",
          position: "top-right",
          width: 16,
          height: 16,
        },
        {
          x: shape.x - shape.radius,
          y: shape.y + shape.radius,
          cursor: "sw-resize",
          position: "bottom-left",
          width: 16,
          height: 16,
        },
        {
          x: shape.x + shape.radius,
          y: shape.y + shape.radius,
          cursor: "se-resize",
          position: "bottom-right",
          width: 16,
          height: 16,
        },
      ];
  }
  return null;
}

function drawResizeHandles(ctx: CanvasRenderingContext2D, shape: Shape) {
  const handles = getResizeHandles(shape);
  if (!handles) return;

  handles.forEach((handle) => {
    ctx.strokeStyle = "#0000FF";

    if (handle.position !== "full") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(handle.x - 8, handle.y - 8, handle.width, handle.height);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0)";
    }
    ctx.strokeRect(handle.x - 8, handle.y - 8, handle.width, handle.height);
  });
}

function isOverResizeHandle(
  pos: { x: number; y: number },
  handle: ResizeHandle
): boolean {
  return (
    Math.abs(pos.x - handle.x) <= handle.width &&
    Math.abs(pos.y - handle.y) <= handle.height
  );
}
