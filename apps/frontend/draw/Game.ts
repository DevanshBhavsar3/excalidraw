import { ResizeHandle, ShapeType, Tool, Tools } from "@/types";
import { getShapes } from "./http";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Line } from "./Line";

type Chat = {
  id: number;
  roomId: number;
  message: ShapeType;
  userId: string;
  shape?: Rectangle | Circle | Line;
};

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: number;
  private shapes: Chat[] = [];
  private startCoordinates = { x: 0, y: 0 };
  private isDrawing = false;
  private isResizing = false;
  private selectedShape: Rectangle | Circle | Line | null = null;
  private activeHandle: ResizeHandle | null = null;
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
      const shapeClass = this.getShapeClass(chat.message, chat.id);

      if (shapeClass) {
        this.shapes.push({ ...chat, shape: shapeClass });
      }
    });

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.cursor = "default";
    this.ctx.strokeStyle = "#000000";
    this.ctx.fillStyle = "#ffffff";

    this.clearCanvas();
  }

  initSocket() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "CHAT":
          const chatMessage = data.message;
          chatMessage.message = JSON.parse(chatMessage.message);

          const shapeClass = this.getShapeClass(
            chatMessage.message,
            chatMessage.roomId
          );

          this.shapes.push({ ...chatMessage, shape: shapeClass });
          break;
        case "UPDATE":
          const updateMessage = data.message;
          const shape = JSON.parse(updateMessage.message);

          const indexOfShape = this.shapes.findIndex(
            (shape) => shape.id === updateMessage.id
          );

          if (indexOfShape !== -1) {
            const updatedShape = this.getShapeClass(shape, updateMessage.id);
            this.shapes[indexOfShape] = {
              ...updateMessage,
              shape: updatedShape,
            };
          }
          break;
        case "DELETE":
          const deleteMessage = data.message;

          this.deleteShape(deleteMessage.id);
          break;
      }
      this.clearCanvas();
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
        roomId: Number(this.roomId),
        message: JSON.stringify(message),
      })
    );
  }

  mouseDown(e: MouseEvent) {
    const currentPos = { x: e.clientX, y: e.clientY };

    if (this.currentTool !== Tools.Cursor) {
      this.isDrawing = true;
      this.startCoordinates.x = e.clientX;
      this.startCoordinates.y = e.clientY;

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
      }
    } else {
      // clear selected shape if there is already one
      if (this.selectedShape) {
        this.clearCanvas();
        this.selectedShape.closeResize();
        this.selectedShape = null;
      }

      const target = this.shapes.find((shape) => {
        if (shape.shape) {
          return shape.shape.isSelected(currentPos);
        }
      });

      if (target && target.shape) {
        this.selectedShape = target.shape;

        if (this.selectedShape.checkForResize(currentPos)) {
          this.isResizing = true;
        }
      }
    }
  }

  mouseMove(e: MouseEvent) {
    if (!this.selectedShape) return;
    const currentPos = { x: e.clientX, y: e.clientY };

    if (this.isDrawing || this.isResizing) {
      this.clearCanvas();
      this.selectedShape.update(this.startCoordinates, currentPos);
      return;
    }
  }

  mouseUp(e: MouseEvent) {
    if (!this.selectedShape) return;

    if (this.isDrawing) {
      this.selectedShape.getProperties();
      this.sendSocketMessage("CHAT", this.selectedShape.getProperties());
    }

    if (this.isResizing) {
      this.selectedShape.closeResize();

      console.log("selected", this.selectedShape);

      // const shapeToUpdate = this.shapes.find(
      //   (shape) => shape.id === this.selectedShape!.id
      // );
      // console.log("update", shapeToUpdate);
      // if (shapeToUpdate) {
      //   shapeToUpdate.message = this.selectedShape.getProperties() as ShapeType;
      //   this.sendSocketMessage("UPDATE", {
      //     id: shapeToUpdate.id,
      //     shape: shapeToUpdate.message,
      //   });
      // }
      this.sendSocketMessage("UPDATE", {
        id: this.selectedShape.id,
        shape: this.selectedShape.getProperties(),
      });

      this.clearCanvas();
    }

    this.isResizing = false;
    this.selectedShape = null;
  }

  mouseHandlers() {
    this.canvas.addEventListener("mousedown", (e) => this.mouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.mouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.mouseUp(e));
  }

  getShapeClass(shape: ShapeType, id: number) {
    switch (shape.kind) {
      case "rect":
        const newRect = new Rectangle(this.ctx, id);
        newRect.updateProperties(shape.x, shape.y, shape.width, shape.height);

        return newRect;
      case "circle":
        const newCircle = new Circle(this.ctx, id);
        newCircle.updateProperties(shape.x, shape.y, shape.radius);

        return newCircle;
      case "line":
        const newLine = new Line(this.ctx, id);
        newLine.updateProperties(shape.x, shape.y, shape.x2, shape.y2);

        return newLine;
    }
  }

  deleteShape(id?: number) {
    let shapeId = id || this.selectedShape?.id;
    let shapeIndex;

    shapeIndex = this.shapes.findIndex((shape) => shape.id === shapeId);

    if (shapeIndex !== -1) {
      this.sendSocketMessage("DELETE", {
        id: shapeId,
      });
      this.shapes.splice(shapeIndex, 1);
      this.selectedShape = null;
    }

    this.clearCanvas();
  }

  setTool(tool: Tools) {
    this.currentTool = tool;
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", (e) => this.mouseDown(e));
    this.canvas.removeEventListener("mousemove", (e) => this.mouseMove(e));
    this.canvas.removeEventListener("mouseup", (e) => this.mouseUp(e));
  }
}
