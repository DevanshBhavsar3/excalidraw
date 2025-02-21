import { Point, RectangleType, ShapeType } from "@/types";
import { Shape } from "./Shape";

export class Rectangle extends Shape {
  public id: number;
  private width = 0;
  private height = 0;

  constructor(ctx: CanvasRenderingContext2D, id: number = 0) {
    super(ctx);
    this.id = id;
  }

  update(startPos: Point, currentPos: Point) {
    if (this.activeHandle) {
      switch (this.activeHandle.position) {
        case "full":
          const halfWidth = this.width / 2;
          const halfHeight = this.height / 2;

          this.x = currentPos.x - halfWidth;
          this.y = currentPos.y - halfHeight;
          break;
        case "bottom-right":
          this.width = currentPos.x - this.x;
          this.height = currentPos.y - this.y;
          break;
      }
    } else {
      const width = currentPos.x - startPos.x;
      const height = currentPos.y - startPos.y;

      this.x = startPos.x;
      this.y = startPos.y;
      this.width = width;
      this.height = height;

      this.draw();
    }
  }

  draw() {
    if (this.activeHandle) {
      this.drawHandles();
    }
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  getProperties(): ShapeType {
    const properties = {
      kind: "rect" as const,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    return properties;
  }

  updateProperties(shape: RectangleType) {
    this.x = shape.x;
    this.y = shape.y;
    this.width = shape.width;
    this.height = shape.height;
  }

  isSelected(currentPos: Point) {
    const minX = Math.min(this.x, this.x + this.width);
    const maxX = Math.max(this.x, this.x + this.width);
    const minY = Math.min(this.y, this.y + this.height);
    const maxY = Math.max(this.y, this.y + this.height);

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

  updateResizeHandles() {
    // #TODO: make it more structured
    this.resizeHandles = [
      {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        cursor: "move",
        position: "full",
        width: 8,
        height: 8,
      },
      {
        x: this.x + this.width,
        y: this.y + this.height,
        cursor: "se-resize",
        position: "bottom-right",
        width: 8,
        height: 8,
      },
    ];
  }

  drawOutline() {
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}
