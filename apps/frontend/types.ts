export type Tool = "rect" | "circle" | "line" | "cursor";

export type ConfigType = {
  currentTool: Tool;
};

export enum Tools {
  Cursor = "Cursor",
  Rectangle = "Rectangle",
  Circle = "Circle",
  Line = "Line",
}

export type RectangleType = {
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleType = {
  kind: "circle";
  x: number;
  y: number;
  radius: number;
};

export type LineType = {
  kind: "line";
  x: number;
  y: number;
  x2: number;
  y2: number;
};

export type ShapeType = RectangleType | CircleType | LineType;

export interface ResizeHandle {
  x: number;
  y: number;
  width: number;
  height: number;
  cursor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "full";
}

export type RectangleConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
};
