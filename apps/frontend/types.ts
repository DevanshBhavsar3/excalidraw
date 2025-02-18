export type Tool = "rect" | "circle" | "line" | "cursor";

export type ConfigType = {
  currentTool: Tool;
};

export type Rectangle = {
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Circle = {
  kind: "circle";
  x: number;
  y: number;
  radius: number;
};

export type Line = {
  kind: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type Shape = Rectangle | Circle | Line;

export interface ResizeHandle {
  x: number;
  y: number;
  width: number;
  height: number;
  cursor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "full";
}
