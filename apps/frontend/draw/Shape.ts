import { Point, ResizeHandle } from "@/types";

export abstract class Shape {
  protected ctx: CanvasRenderingContext2D;
  protected x = 0;
  protected y = 0;
  protected activeHandle: ResizeHandle | null = null;
  protected resizeHandles: ResizeHandle[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  checkForResize(pos: Point) {
    this.updateResizeHandles();

    this.resizeHandles.forEach((handle) => {
      if (!this.activeHandle) {
        if (
          Math.abs(pos.x - handle.x) <= handle.width &&
          Math.abs(pos.y - handle.y) <= handle.height
        ) {
          this.activeHandle = handle;
          return true;
        }
      }
    });

    return this.activeHandle;
  }

  drawHandles() {
    this.updateResizeHandles();

    this.ctx.fillStyle = "#ffffff";
    this.ctx.strokeStyle = "#0000FF";

    this.ctx.setLineDash([10]);
    this.drawOutline();
    this.ctx.setLineDash([0]);

    this.resizeHandles.forEach((handle) => {
      this.ctx.beginPath();
      this.ctx.roundRect(
        handle.x - 4,
        handle.y - 4,
        handle.width,
        handle.height,
        4
      );
      this.ctx.stroke();
    });
    this.ctx.strokeStyle = "#000000";
  }

  showCursor(canvas: HTMLCanvasElement, currentPos: Point) {
    const handleUnderCursor = this.resizeHandles.find(
      (handle) =>
        Math.abs(currentPos.x - handle.x) <= handle.width &&
        Math.abs(currentPos.y - handle.y) <= handle.height
    );

    canvas.style.cursor = handleUnderCursor
      ? handleUnderCursor.cursor
      : "default";
  }

  closeResize() {
    this.activeHandle = null;
  }

  abstract updateResizeHandles(): void;
  abstract drawOutline(): void;
}
