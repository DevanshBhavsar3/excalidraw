import { CircleType, Point, ShapeType } from "@/types";
import { Shape } from "./Shape";

export class Circle extends Shape {
  private radius = 0;
  public id: number;

  constructor(ctx: CanvasRenderingContext2D, id: number = 0) {
    super(ctx);
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
