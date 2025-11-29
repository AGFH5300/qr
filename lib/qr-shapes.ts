// QR Code shape definitions for body, eye frame, and eye ball customization

export type BodyShape =
  | "square"
  | "rounded"
  | "dots"
  | "dots-small"
  | "diamond"
  | "star"
  | "hexagon"
  | "vertical-bars"
  | "horizontal-bars"
  | "rounded-vertical"
  | "rounded-horizontal"
  | "classy"
  | "classy-rounded"
  | "edge-cut"
  | "edge-cut-smooth"
  | "pointed"
  | "pointed-smooth"
  | "pointed-in"
  | "pointed-in-smooth"
  | "blob"

export type EyeFrameShape =
  | "square"
  | "rounded"
  | "rounded-sm"
  | "circle"
  | "rounded-heavy"
  | "dotted"
  | "dotted-square"
  | "leaf"
  | "cushion"
  | "pointed"
  | "inpoint"
  | "outpoint"
  | "eye"
  | "shield"
  | "double"

export type EyeBallShape =
  | "square"
  | "rounded"
  | "rounded-sm"
  | "circle"
  | "dots"
  | "clover"
  | "diamond"
  | "leaf"
  | "shield"
  | "star"
  | "cross"
  | "bars-vertical"
  | "bars-horizontal"
  | "pointed"
  | "blob"
  | "rhombus"
  | "gear"

export interface ShapeOption<T extends string> {
  id: T
  name: string
}

export const bodyShapes: ShapeOption<BodyShape>[] = [
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
  { id: "dots", name: "Dots" },
  { id: "dots-small", name: "Dots Small" },
  { id: "diamond", name: "Diamond" },
  { id: "star", name: "Star" },
  { id: "hexagon", name: "Hexagon" },
  { id: "vertical-bars", name: "Vertical Bars" },
  { id: "horizontal-bars", name: "Horizontal Bars" },
  { id: "rounded-vertical", name: "Rounded Vertical" },
  { id: "rounded-horizontal", name: "Rounded Horizontal" },
  { id: "classy", name: "Classy" },
  { id: "classy-rounded", name: "Classy Rounded" },
  { id: "edge-cut", name: "Edge Cut" },
  { id: "edge-cut-smooth", name: "Edge Cut Smooth" },
  { id: "pointed", name: "Pointed" },
  { id: "pointed-smooth", name: "Pointed Smooth" },
  { id: "pointed-in", name: "Pointed In" },
  { id: "pointed-in-smooth", name: "Pointed In Smooth" },
  { id: "blob", name: "Blob" },
]

export const eyeFrameShapes: ShapeOption<EyeFrameShape>[] = [
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
  { id: "rounded-sm", name: "Rounded Small" },
  { id: "circle", name: "Circle" },
  { id: "rounded-heavy", name: "Rounded Heavy" },
  { id: "dotted", name: "Dotted" },
  { id: "dotted-square", name: "Dotted Square" },
  { id: "leaf", name: "Leaf" },
  { id: "cushion", name: "Cushion" },
  { id: "pointed", name: "Pointed" },
  { id: "inpoint", name: "Inpoint" },
  { id: "outpoint", name: "Outpoint" },
  { id: "eye", name: "Eye" },
  { id: "shield", name: "Shield" },
  { id: "double", name: "Double" },
]

export const eyeBallShapes: ShapeOption<EyeBallShape>[] = [
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded" },
  { id: "rounded-sm", name: "Rounded Small" },
  { id: "circle", name: "Circle" },
  { id: "dots", name: "Dots" },
  { id: "clover", name: "Clover" },
  { id: "diamond", name: "Diamond" },
  { id: "leaf", name: "Leaf" },
  { id: "shield", name: "Shield" },
  { id: "star", name: "Star" },
  { id: "cross", name: "Cross" },
  { id: "bars-vertical", name: "Vertical Bars" },
  { id: "bars-horizontal", name: "Horizontal Bars" },
  { id: "pointed", name: "Pointed" },
  { id: "blob", name: "Blob" },
  { id: "rhombus", name: "Rhombus" },
  { id: "gear", name: "Gear" },
]
