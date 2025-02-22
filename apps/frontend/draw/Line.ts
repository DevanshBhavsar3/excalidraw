import { LineType, Point, ShapeConfig } from "@/types";
import { Shape } from "./Shape";
import { RoughCanvas } from "roughjs/bin/canvas";

export class Line extends Shape {
  private rc: RoughCanvas;
  private x2 = 0;
  private y2 = 0;
  public id: number;

  constructor(
    rc: RoughCanvas,
    ctx: CanvasRenderingContext2D,
    shapeConfig: ShapeConfig,
    id: number = 0
  ) {
    super(ctx, shapeConfig);
    this.rc = rc;
    this.id = id;
  }

  update(startPos: Point, currentPos: Point) {
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
      this.drawHandles();
    }

    this.rc.line(this.x, this.y, this.x2, this.y2, {
      seed: 1,
      ...this.shapeConfig,
    });
  }

  getProperties() {
    const properties = {
      kind: "line",
      x: this.x,
      y: this.y,
      x2: this.x2,
      y2: this.y2,
      config: this.shapeConfig,
    };

    return properties;
  }

  updateProperties(shape: LineType) {
    this.x = shape.x;
    this.y = shape.y;
    this.x2 = shape.x2;
    this.y2 = shape.y2;
  }

  isSelected(currentPos: Point) {
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
      this.drawHandles();
      return true;
    }
    return false;
  }

  updateResizeHandles() {
    this.resizeHandles = [
      {
        x: (this.x + this.x2) / 2,
        y: (this.y + this.y2) / 2,
        cursor: "move",
        position: "full",
        width: 8,
        height: 8,
      },
      {
        x: this.x,
        y: this.y,
        cursor: "ne-resize",
        position: "top-left",
        width: 8,
        height: 8,
      },
      {
        x: this.x2,
        y: this.y2,
        cursor: "ne-resize",
        position: "top-right",
        width: 8,
        height: 8,
      },
    ];
  }

  drawOutline() {
    this.ctx.strokeRect(this.x, this.y, this.x2 - this.x, this.y2 - this.y);
  }
}
