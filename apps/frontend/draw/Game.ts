import { Chat, Point, ShapeConfig, ShapeType, State, Tools } from "@/types";
import { getShapes } from "../http";
import { Rectangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Line } from "./Line";
import { Pencil } from "./Pencil";
import { redirect } from "next/navigation";
import { RoughCanvas } from "roughjs/bin/canvas";
import rough from "roughjs";

export class Game {
  private canvas: HTMLCanvasElement;
  private rc: RoughCanvas;
  private ctx: CanvasRenderingContext2D;
  private roomId: number;
  private socket: WebSocket;
  private setState: (state: State) => void;
  private shapes: Chat[] = [];
  private startCoordinates: Point = { x: 0, y: 0 };
  private offset: Point = { x: 0, y: 0 };
  public scale: number = 1;
  private isDrawing = false;
  private isResizing = false;
  private isPanning = false;
  private selectedShape: Rectangle | Circle | Line | Pencil | null = null;
  private currentTool: Tools = Tools.Cursor;
  public shapeConfig: ShapeConfig = {
    roughness: 1,
    fill: "rgba(0,0,0,0)",
    stroke: "#000000",
    strokeWidth: 1,
    fillStyle: "solid",
  };

  constructor(
    canvas: HTMLCanvasElement,
    roomId: number,
    socket: WebSocket,
    setState: (state: State) => void
  ) {
    this.canvas = canvas;
    this.rc = rough.canvas(this.canvas);
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.setState = setState;
    this.init();
    this.initSocket();
    this.mouseHandlers();
  }

  async init() {
    try {
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
    } catch (e) {
      alert(e);
      redirect("/");
    }
  }

  initSocket() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      try {
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

            alert(errorMessage);
            break;
        }

        this.clearCanvas();
      } catch (e) {
        alert("Error in websocket. Consider rejoining the room.");
        redirect("/");
      }
    };
  }

  clearCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);

    this.shapes.forEach((shape) => {
      if (shape.shape) {
        shape.shape.draw();
      }
    });
  }

  sendSocketMessage(type: string, message: string) {
    this.socket.send(
      JSON.stringify({
        type,
        roomId: this.roomId,
        message: message,
      })
    );
  }

  mouseDown(e: MouseEvent) {
    const currentPos = {
      x: Math.floor((e.clientX - this.offset.x) / this.scale),
      y: Math.floor((e.clientY - this.offset.y) / this.scale),
    };

    if (this.currentTool !== Tools.Cursor && this.currentTool !== Tools.Hand) {
      this.isDrawing = true;
      this.startCoordinates.x = currentPos.x;
      this.startCoordinates.y = currentPos.y;

      switch (this.currentTool) {
        case Tools.Rectangle:
          this.selectedShape = new Rectangle(
            this.rc,
            this.ctx,
            this.shapeConfig
          );
          break;
        case Tools.Circle:
          this.selectedShape = new Circle(this.rc, this.ctx, this.shapeConfig);
          break;
        case Tools.Line:
          this.selectedShape = new Line(this.rc, this.ctx, this.shapeConfig);
          break;
        case Tools.Pencil:
          this.selectedShape = new Pencil(this.ctx, this.shapeConfig);
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
      this.updateState();
    }
  }

  mouseMove(e: MouseEvent) {
    const currentPos = {
      x: e.clientX,
      y: e.clientY,
    };
    if (this.isPanning) {
      this.canvas.style.cursor = "grabbing";

      const dx = currentPos.x - this.startCoordinates.x;
      const dy = currentPos.y - this.startCoordinates.y;

      this.offset.x += dx;
      this.offset.y += dy;
      this.startCoordinates = currentPos;

      this.clearCanvas();
      return;
    }

    if (!this.selectedShape) return;

    currentPos.x = Math.floor((currentPos.x - this.offset.x) / this.scale);
    currentPos.y = Math.floor((currentPos.y - this.offset.y) / this.scale);

    // show cursor when hovering
    this.selectedShape.showCursor(this.canvas, currentPos);
    if (this.isDrawing || this.isResizing) {
      this.clearCanvas();
      this.selectedShape.update(this.startCoordinates, currentPos);
      return;
    }
  }

  mouseUp(e: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "grab";
      return;
    }

    if (!this.selectedShape) return;
    this.canvas.style.cursor = "default";

    if (this.isDrawing) {
      this.sendSocketMessage(
        "CHAT",
        JSON.stringify(this.selectedShape.getProperties())
      );

      this.isDrawing = false;
      this.selectedShape = null;
      this.setTool(Tools.Cursor);
      return;
    }

    if (this.isResizing) {
      this.sendSocketMessage(
        "UPDATE",
        JSON.stringify({
          id: this.selectedShape.id,
          shape: this.selectedShape.getProperties(),
        })
      );

      this.isResizing = false;
      this.selectedShape.closeResize();
      this.selectedShape = null;
      this.updateState();
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
        const newRect = new Rectangle(this.rc, this.ctx, shape.config, id);
        newRect.updateProperties(shape);

        return newRect;
      case "circle":
        const newCircle = new Circle(this.rc, this.ctx, shape.config, id);
        newCircle.updateProperties(shape);

        return newCircle;
      case "line":
        const newLine = new Line(this.rc, this.ctx, shape.config, id);
        newLine.updateProperties(shape);

        return newLine;
      case "pencil":
        const newPencil = new Pencil(this.ctx, shape.config, id);
        newPencil.updateProperties(shape);

        return newPencil;
    }
  }

  deleteShape() {
    if (this.selectedShape) {
      this.sendSocketMessage(
        "DELETE",
        JSON.stringify({
          id: this.selectedShape.id,
        })
      );
      this.selectedShape = null;
      this.updateState();
      this.clearCanvas();
    }
  }

  setTool(tool: Tools) {
    this.currentTool = tool;

    switch (tool) {
      case Tools.Hand:
        this.canvas.style.cursor = "grab";
        break;
      case Tools.Rectangle:
      case Tools.Circle:
      case Tools.Line:
      case Tools.Pencil:
        this.canvas.style.cursor = "crosshair";
        break;
      case Tools.Cursor:
        this.canvas.style.cursor = "default";
        break;
      default:
        this.canvas.style.cursor = "default";
    }

    this.updateState();
  }

  zoom(scale: number, e?: WheelEvent) {
    const oldScale = this.scale;
    this.scale = Number(
      Math.max(0.1, Math.min(5, this.scale - scale)).toFixed(2)
    );

    // Get mouse position relative to canvas
    const mouseX = e
      ? e.clientX - this.offset.x
      : (this.canvas.width * this.scale) / 2;
    const mouseY = e
      ? e.clientY - this.offset.y
      : (this.canvas.height * this.scale) / 2;

    // Adjust offset based on mouse position and scale change
    this.offset.x -= mouseX * (this.scale / oldScale - 1);
    this.offset.y -= mouseY * (this.scale / oldScale - 1);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);

    this.updateState();
    this.clearCanvas();
  }

  resetScale() {
    this.scale = 1;
    this.updateState();
    this.clearCanvas();
  }

  updateState() {
    this.setState({
      tool: this.currentTool,
      scale: this.scale,
      config: this.shapeConfig,
      showDelete: this.selectedShape ? true : false,
    });
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", (e) => this.mouseDown(e));
    this.canvas.removeEventListener("mousemove", (e) => this.mouseMove(e));
    this.canvas.removeEventListener("mouseup", (e) => this.mouseUp(e));
  }
}
