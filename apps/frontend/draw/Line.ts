import { LineType, ShapeType } from "@/types";
import { Shape } from "./Shape";

export class Line extends Shape {
  private x2 = 0;
  private y2 = 0;
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
          const halfWidth = (this.x2 - this.x) / 2;
          const halfHeight = (this.y2 - this.y) / 2;

          this.x = currentPos.x - halfWidth;
          this.y = currentPos.y - halfHeight;
          this.x2 = currentPos.x + halfWidth;
          this.y2 = currentPos.y + halfHeight;
          break;
        case "top-left":
          this.x = currentPos.x;
          this.y = currentPos.y;
          break;
        case "top-right":
          this.x2 = currentPos.x;
          this.y2 = currentPos.y;
          break;
      }
    } else {
      this.x = startPos.x;
      this.y = startPos.y;
      this.x2 = currentPos.x;
      this.y2 = currentPos.y;

      this.draw();
    }
  }

  draw() {
    if (this.activeHandle) {
      this.renderResizeHandles();
    }

    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(this.x2, this.y2);
    this.ctx.stroke();
  }

  getProperties(): ShapeType {
    const properties = {
      kind: "line" as const,
      x: this.x,
      y: this.y,
      x2: this.x2,
      y2: this.y2,
    };

    return properties;
  }

  updateProperties(shape: LineType) {
    this.x = shape.x;
    this.y = shape.y;
    this.x2 = shape.x2;
    this.y2 = shape.y2;
  }

  isSelected(currentPos: { x: number; y: number }) {
    const a = { x: this.x, y: this.y };
    const b = { x: this.x2, y: this.y2 };
    const c = currentPos;

    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ac = { x: c.x - a.x, y: c.y - a.y };
    const abSq = ab.x * ab.x + ab.y * ab.y;

    const t = Math.max(0, Math.min(1, (ab.x * ac.x + ab.y * ac.y) / abSq));

    const closest = {
      x: a.x + ab.x * t,
      y: a.y + ab.y * t,
    };

    const distance = Math.sqrt(
      Math.pow(c.x - closest.x, 2) + Math.pow(c.y - closest.y, 2)
    );

    if (distance <= 10) {
      this.renderResizeHandles();
      return true;
    }
    return false;
  }

  renderResizeHandles() {
    this.resizeHandles = [
      {
        x: (this.x + this.x2) / 2,
        y: (this.y + this.y2) / 2,
        cursor: "move",
        position: "full",
        width: 16,
        height: 16,
      },
      {
        x: this.x,
        y: this.y,
        cursor: "nw-resize",
        position: "top-left",
        width: 16,
        height: 16,
      },
      {
        x: this.x2,
        y: this.y2,
        cursor: "ne-resize",
        position: "top-right",
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
