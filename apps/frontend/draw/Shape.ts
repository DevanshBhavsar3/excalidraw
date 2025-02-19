import { ResizeHandle } from "@/types";

export abstract class Shape {
  protected ctx: CanvasRenderingContext2D;
  protected x = 0;
  protected y = 0;
  protected activeHandle: ResizeHandle | null = null;
  protected resizeHandles: ResizeHandle[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  checkForResize(pos: { x: number; y: number }) {
    this.resizeHandles.forEach((handle) => {
      if (!this.activeHandle) {
        if (
          Math.abs(pos.x - handle.x) <= handle.width &&
          Math.abs(pos.y - handle.y) <= handle.height
        ) {
          this.activeHandle = handle;
        }
      }
    });

    return this.activeHandle;
  }

  drawHandles() {
    this.resizeHandles.forEach((handle) => {
      this.ctx.strokeStyle = "#0000FF";
      this.ctx.fillStyle = "#ffffff";

      this.ctx.fillRect(
        handle.x - 8,
        handle.y - 8,
        handle.width,
        handle.height
      );
      this.ctx.strokeRect(
        handle.x - 8,
        handle.y - 8,
        handle.width,
        handle.height
      );

      this.ctx.strokeStyle = "#000000";
    });
  }
}
