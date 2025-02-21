import { Point, ShapeType, Tools } from "@/types";
import { getShapes } from "./http";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Line } from "./Line";
import { Pencil } from "./Pencil";

type Chat = {
  id: number;
  roomId: number;
  message: ShapeType;
  userId: string;
  shape: Rectangle | Circle | Line | Pencil;
};

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: number;
  private shapes: Chat[] = [];
  private startCoordinates: Point = { x: 0, y: 0 };
  private offset: Point = { x: 0, y: 0 };
  private scale: number = 1;
  private isDrawing = false;
  private isResizing = false;
  private isPanning = false;
  private selectedShape: Rectangle | Circle | Line | Pencil | null = null;
  private socket: WebSocket;
  private currentTool: Tools = Tools.Cursor;

  constructor(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.init();
    this.initSocket();
    this.mouseHandlers();
  }

  async init() {
    const chats = await getShapes(this.roomId);
    const existingShapes: Chat[] = chats;

    existingShapes.forEach((chat) => {
      const shapeClass = this.createShapeClass(chat.message, chat.id);

      if (shapeClass) {
        this.shapes.push({ ...chat, shape: shapeClass });
      }
    });

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.cursor = "default";
    this.ctx.strokeStyle = "#000000";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.lineWidth = 2;

    this.clearCanvas();
  }

  initSocket() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "CHAT":
          const chatMessage = data.message;
          const newShape = JSON.parse(chatMessage.message);

          const shapeClass = this.createShapeClass(newShape, chatMessage.id);

          this.shapes.push({ ...chatMessage, shape: shapeClass });
          break;
        case "UPDATE":
          const updateMessage = data.message;
          const updatedProperties = JSON.parse(
            updateMessage.message
          ) as ShapeType;

          const shapeToUpdate = this.shapes.find(
            (shape) => shape.id === updateMessage.id
          );

          if (shapeToUpdate) {
            // @ts-ignore
            shapeToUpdate.shape.updateProperties(updatedProperties);
          }
          break;
        case "DELETE":
          const deleteMessage = data.message;

          const shapeIndex = this.shapes.findIndex(
            (shape) => shape.id === deleteMessage.id
          );

          if (shapeIndex !== -1) {
            this.shapes.splice(shapeIndex, 1);
          }
          break;
        case "ERROR":
          const errorMessage = data.message;

          this.ctx.font = "16px serif";
          this.ctx.fillStyle = "#FF0000"; // Change to red for error messages
          this.ctx.textAlign = "center";
          this.ctx.fillText(
            errorMessage,
            this.canvas.width - 100,
            this.canvas.height - 10
          );
      }

      this.clearCanvas();
    };
  }

  clearCanvas() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);

    this.shapes.forEach((shape) => {
      if (shape.shape) {
        shape.shape.draw();
      }
    });
  }

  sendSocketMessage(type: string, message: any) {
    this.socket.send(
      JSON.stringify({
        type,
        roomId: this.roomId,
        message: JSON.stringify(message),
      })
    );
  }

  mouseDown(e: MouseEvent) {
    const currentPos = {
      x: (e.clientX - this.offset.x) / this.scale,
      y: (e.clientY - this.offset.y) / this.scale,
    };

    if (this.currentTool !== Tools.Cursor && this.currentTool !== Tools.Hand) {
      this.isDrawing = true;
      this.startCoordinates.x = currentPos.x;
      this.startCoordinates.y = currentPos.y;

      switch (this.currentTool) {
        case Tools.Rectangle:
          this.selectedShape = new Rectangle(this.ctx);
          break;
        case Tools.Circle:
          this.selectedShape = new Circle(this.ctx);
          break;
        case Tools.Line:
          this.selectedShape = new Line(this.ctx);
          break;
        case Tools.Pencil:
          this.selectedShape = new Pencil(this.ctx);
          break;
      }
    } else {
      if (this.currentTool === Tools.Hand) {
        this.startCoordinates.x = e.clientX;
        this.startCoordinates.y = e.clientY;
        this.isPanning = true;
        return;
      }

      // clear selected shape if there is already one
      if (this.selectedShape) {
        this.selectedShape.closeResize();
        this.selectedShape = null;
        this.clearCanvas();
      }

      const target = this.shapes.find((shape) => {
        if (shape.shape) {
          return shape.shape.isSelected(currentPos);
        }
      });

      if (target && target.shape) {
        this.selectedShape = target.shape;

        if (target.shape.checkForResize(currentPos)) {
          this.isResizing = true;
        }
      }
    }
  }

  mouseMove(e: MouseEvent) {
    const currentPos = {
      x: e.clientX,
      y: e.clientY,
    };
    if (this.isPanning) {
      const dx = currentPos.x - this.startCoordinates.x;
      const dy = currentPos.y - this.startCoordinates.y;

      this.offset.x += dx;
      this.offset.y += dy;
      this.startCoordinates = currentPos;

      this.clearCanvas();
      return;
    }

    if (!this.selectedShape) return;

    currentPos.x = (currentPos.x - this.offset.x) / this.scale;
    currentPos.y = (currentPos.y - this.offset.y) / this.scale;

    if (this.selectedShape) {
      this.selectedShape.showCursor(this.canvas, currentPos);
    }

    if (this.isDrawing || this.isResizing) {
      this.clearCanvas();
      this.selectedShape.update(this.startCoordinates, currentPos);
      return;
    }
  }

  mouseUp(e: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    if (!this.selectedShape) return;
    this.canvas.style.cursor = "default";

    if (this.isDrawing) {
      this.sendSocketMessage("CHAT", this.selectedShape.getProperties());

      this.isDrawing = false;
      this.selectedShape = null;
      return;
    }

    if (this.isResizing) {
      this.sendSocketMessage("UPDATE", {
        id: this.selectedShape.id,
        shape: this.selectedShape.getProperties(),
      });

      this.isResizing = false;
      this.selectedShape.closeResize();
      return;
    }
  }

  mouseHandlers() {
    this.canvas.addEventListener("mousedown", (e) => this.mouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.mouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.mouseUp(e));

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const scale = e.deltaY * 0.001;
      this.zoom(scale, e);
    });
  }

  createShapeClass(shape: ShapeType, id: number) {
    switch (shape.kind) {
      case "rect":
        const newRect = new Rectangle(this.ctx, id);
        newRect.updateProperties(shape);

        return newRect;
      case "circle":
        const newCircle = new Circle(this.ctx, id);
        newCircle.updateProperties(shape);

        return newCircle;
      case "line":
        const newLine = new Line(this.ctx, id);
        newLine.updateProperties(shape);

        return newLine;
      case "pencil":
        const newPencil = new Pencil(this.ctx, id);
        newPencil.updateProperties(shape);

        return newPencil;
    }
  }

  deleteShape() {
    if (this.selectedShape) {
      this.sendSocketMessage("DELETE", {
        id: this.selectedShape.id,
      });
      this.selectedShape = null;
      this.clearCanvas();
    }
  }

  setTool(tool: Tools) {
    this.currentTool = tool;
    if (tool !== Tools.Cursor) {
      this.canvas.style.cursor = "crosshair";
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  zoom(scale: number, e: WheelEvent) {
    const oldScale = this.scale;
    this.scale = Number(
      Math.max(0.1, Math.min(5, this.scale - scale)).toFixed(2)
    );

    // Get mouse position relative to canvas
    const mouseX = e.clientX - this.offset.x;
    const mouseY = e.clientY - this.offset.y;

    // Adjust offset based on mouse position and scale change
    this.offset.x -= mouseX * (this.scale / oldScale - 1);
    this.offset.y -= mouseY * (this.scale / oldScale - 1);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);

    this.clearCanvas();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", (e) => this.mouseDown(e));
    this.canvas.removeEventListener("mousemove", (e) => this.mouseMove(e));
    this.canvas.removeEventListener("mouseup", (e) => this.mouseUp(e));
  }
}
