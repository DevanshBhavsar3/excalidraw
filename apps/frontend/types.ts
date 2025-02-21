export type Point = {
  x: number;
  y: number;
};

export enum Tools {
  Hand = "Hand",
  Cursor = "Cursor",
  Rectangle = "Rectangle",
  Circle = "Circle",
  Line = "Line",
  Pencil = "Pencil",
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

export type PencilType = {
  kind: "pencil";
  strokes: Point[];
};

export type ShapeType = RectangleType | CircleType | LineType | PencilType;

export interface ResizeHandle {
  x: number;
  y: number;
  width: number;
  height: number;
  cursor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "full";
}
