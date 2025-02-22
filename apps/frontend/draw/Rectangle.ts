import { Point, RectangleType, ShapeConfig, ShapeType } from "@/types";
import { Shape } from "./Shape";
import { RoughCanvas } from "roughjs/bin/canvas";

export class Rectangle extends Shape {
  private rc: RoughCanvas;
  public id: number;
  private width = 0;
  private height = 0;

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

    this.rc.rectangle(this.x, this.y, this.width, this.height, {
      seed: 1,
      ...this.shapeConfig,
    });
  }

  getProperties(): ShapeType {
    const properties = {
      kind: "rect" as const,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      config: this.shapeConfig,
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
