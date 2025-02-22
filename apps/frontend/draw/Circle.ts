import { CircleType, Point, ShapeConfig, ShapeType } from "@/types";
import { Shape } from "./Shape";
import { RoughCanvas } from "roughjs/bin/canvas";

export class Circle extends Shape {
  private rc: RoughCanvas;
  private radius = 0;
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
          this.x = currentPos.x;
          this.y = currentPos.y;
          break;
        case "bottom-right":
          this.radius = Math.floor(
            Math.sqrt(
              Math.pow(currentPos.x - this.x, 2) +
                Math.pow(currentPos.y - this.y, 2)
            )
          );
          break;
      }
    } else {
      this.x = startPos.x;
      this.y = startPos.y;
      this.radius = Math.floor(
        Math.sqrt(
          Math.pow(currentPos.x - startPos.x, 2) +
            Math.pow(currentPos.y - startPos.y, 2)
        )
      );

      this.draw();
    }
  }

  draw() {
    if (this.activeHandle) {
      this.drawHandles();
    }

    this.rc.circle(this.x, this.y, this.radius * 2, {
      seed: 1,
      ...this.shapeConfig,
    });
  }

  getProperties(): ShapeType {
    const properties = {
      kind: "circle" as const,
      x: this.x,
      y: this.y,
      radius: this.radius,
      config: this.shapeConfig,
    };

    return properties;
  }

  updateProperties(shape: CircleType) {
    this.x = shape.x;
    this.y = shape.y;
    this.radius = shape.radius;
  }

  isSelected(currentPos: Point) {
    const distance = Math.sqrt(
      Math.pow(currentPos.x - this.x, 2) + Math.pow(currentPos.y - this.y, 2)
    );

    if (distance < this.radius) {
      this.drawHandles();
      return true;
    }

    return false;
  }

  updateResizeHandles() {
    this.resizeHandles = [
      {
        x: this.x,
        y: this.y,
        cursor: "move",
        position: "full",
        width: 8,
        height: 8,
      },
      {
        x: this.x + this.radius,
        y: this.y,
        cursor: "se-resize",
        position: "bottom-right",
        width: 8,
        height: 8,
      },
    ];
  }

  drawOutline() {
    this.ctx.strokeRect(
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }
}
