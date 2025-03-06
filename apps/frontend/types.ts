import { Circle } from "./draw/Circle";
import { Line } from "./draw/Line";
import { Pencil } from "./draw/Pencil";
import { Rectangle } from "./draw/Rectangle";

export type Point = {
  x: number;
  y: number;
};

export type Chat = {
  id: number;
  roomId: number;
  message: ShapeType;
  userId: string;
  shape: Rectangle | Circle | Line | Pencil;
};

export enum Tools {
  Hand = "Hand",
  Cursor = "Cursor",
  Rectangle = "Rectangle",
  Circle = "Circle",
  Line = "Line",
  Pencil = "Pencil",
  AI = "AI",
}

export type RectangleType = {
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  config: ShapeConfig;
};

export type CircleType = {
  kind: "circle";
  x: number;
  y: number;
  radius: number;
  config: ShapeConfig;
};

export type LineType = {
  kind: "line";
  x: number;
  y: number;
  x2: number;
  y2: number;
  config: ShapeConfig;
};

export type PencilType = {
  kind: "pencil";
  strokes: Point[];
  config: ShapeConfig;
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

export interface ShapeConfig {
  roughness: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillStyle: "solid" | "zigzag" | "cross-hatch" | "dashed";
}

export interface State {
  tool: Tools;
  scale: number;
  config: ShapeConfig;
  showDelete: boolean;
}
