import { PencilType, Point } from "@/types";
import { Shape } from "./Shape";

export class Pencil extends Shape {
  public strokes: Point[] = [];
  private minPoint: Point = { x: 100000, y: 100000 };
  private maxPoint: Point = { x: -100000, y: -100000 };
  public id: number;

  constructor(ctx: CanvasRenderingContext2D, id: number = 0) {
    super(ctx);
    this.id = id;
    ctx.strokeStyle = "#000000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  update(startPos: Point, currentPos: Point) {
    if (this.activeHandle) {
      if (this.activeHandle.position === "full") {
        const deltaX = currentPos.x - this.strokes[0].x;
        const deltaY = currentPos.y - this.strokes[0].y;

        this.strokes = this.strokes.map((stroke) => ({
          x: stroke.x + deltaX,
          y: stroke.y + deltaY,
        }));
      }
    } else {
      this.strokes.push(currentPos);
      this.draw();
    }
  }

  draw() {
    const startPos = this.strokes[0];

    if (startPos) {
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.moveTo(startPos.x, startPos.y);
      this.strokes.forEach((stroke) => {
        this.ctx.lineTo(stroke.x, stroke.y);
        this.ctx.moveTo(stroke.x, stroke.y);
      });
      this.ctx.stroke();
    }
  }

  updateBoundingBox() {
    this.minPoint = { x: 100000, y: 100000 };
    this.maxPoint = { x: -100000, y: -100000 };

    this.strokes.forEach((stroke) => {
      this.minPoint.x = Math.min(stroke.x, this.minPoint.x);
      this.minPoint.y = Math.min(stroke.y, this.minPoint.y);
      this.maxPoint.x = Math.max(stroke.x, this.maxPoint.x);
      this.maxPoint.y = Math.max(stroke.y, this.maxPoint.y);
    });
  }

  getProperties() {
    const properties = {
      kind: "pencil",
      strokes: this.strokes,
    };

    return properties;
  }

  updateProperties(shape: PencilType) {
    this.strokes = shape.strokes;
  }

  isSelected(currentPos: Point) {
    this.updateBoundingBox();

    const minX = this.minPoint.x;
    const minY = this.minPoint.y;
    const maxX = this.maxPoint.x;
    const maxY = this.maxPoint.y;

    if (
      currentPos.x >= minX &&
      currentPos.x <= maxX &&
      currentPos.y >= minY &&
      currentPos.y <= maxY
    ) {
      this.drawHandles();
      return true;
    }

    return false;
  }

  updateResizeHandles(): void {
    this.resizeHandles = [
      {
        x: this.minPoint.x + (this.maxPoint.x - this.minPoint.x) / 2,
        y: this.minPoint.y + (this.maxPoint.y - this.minPoint.y) / 2,
        cursor: "move",
        position: "full",
        width: 8,
        height: 8,
      },
    ];
  }

  drawOutline() {
    this.ctx.strokeRect(
      this.minPoint.x,
      this.minPoint.y,
      this.maxPoint.x - this.minPoint.x,
      this.maxPoint.y - this.minPoint.y
    );
  }
}
