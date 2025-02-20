import { CircleType, ShapeType } from "@/types";
import { Shape } from "./Shape";

export class Circle extends Shape {
  private radius = 0;
  public id: number;

  constructor(ctx: CanvasRenderingContext2D, id: number = 0) {
    super(ctx);
    this.id = id;
  }

  update(
    startPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    if (this.activeHandle) {
      switch (this.activeHandle.position) {
        case "full":
          this.x = currentPos.x;
          this.y = currentPos.y;
          break;
        case "bottom-right":
        case "top-right":
        case "top-left":
        case "bottom-left":
          this.radius = Math.floor(Math.abs(this.y - currentPos.y));
          break;
      }
    } else {
      this.x = startPos.x;
      this.y = startPos.y;
      this.radius = Math.floor(Math.abs(currentPos.y - startPos.y));

      this.draw();
    }
  }

  draw() {
    if (this.activeHandle) {
      this.renderResizeHandles();
    }

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  getProperties(): ShapeType {
    const properties = {
      kind: "circle" as const,
      x: this.x,
      y: this.y,
      radius: this.radius,
    };

    return properties;
  }

  updateProperties(shape: CircleType) {
    this.x = shape.x;
    this.y = shape.y;
    this.radius = shape.radius;
  }

  isSelected(currentPos: { x: number; y: number }) {
    const distance = Math.sqrt(
      Math.pow(currentPos.x - this.x, 2) + Math.pow(currentPos.y - this.y, 2)
    );

    if (distance < this.radius) {
      this.renderResizeHandles();
      return true;
    }

    return false;
  }

  renderResizeHandles() {
    this.resizeHandles = [
      {
        x: this.x,
        y: this.y,
        cursor: "move",
        position: "full",
        width: 16,
        height: 16,
      },
      {
        x: this.x + this.radius,
        y: this.y + this.radius,
        cursor: "se-resize",
        position: "bottom-right",
        width: 16,
        height: 16,
      },
    ];

    this.drawHandles();
  }

  closeResize() {
    this.activeHandle = null;
  }
}
