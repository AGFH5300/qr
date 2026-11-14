"use client"

import { cn } from "@/lib/utils"
import type { ShapeOption, BodyShape, EyeFrameShape, EyeBallShape } from "@/lib/qr-shapes"

interface ShapeSelectorProps<T extends string> {
  shapes: ShapeOption<T>[]
  selectedShape: T
  onSelect: (shape: T) => void
  type: "body" | "eyeFrame" | "eyeBall"
}

export function ShapeSelector<T extends string>({ shapes, selectedShape, onSelect, type }: ShapeSelectorProps<T>) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {shapes.map((shape) => (
        <button
          key={shape.id}
          onClick={() => onSelect(shape.id as T)}
          className={cn(
            "relative aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 p-1.5 bg-card",
            selectedShape === shape.id
              ? "border-primary ring-2 ring-primary/20 shadow-sm"
              : "border-border hover:border-muted-foreground/50",
          )}
          title={shape.name}
        >
          <ShapePreview type={type} shape={shape.id} />
        </button>
      ))}
    </div>
  )
}

function ShapePreview({ type, shape }: { type: "body" | "eyeFrame" | "eyeBall"; shape: string }) {
  if (type === "body") {
    return <BodyShapePreview shape={shape as BodyShape} />
  }
  if (type === "eyeFrame") {
    return <EyeFrameShapePreview shape={shape as EyeFrameShape} />
  }
  return <EyeBallShapePreview shape={shape as EyeBallShape} />
}

function BodyShapePreview({ shape }: { shape: BodyShape }) {
  const size = 40
  const moduleSize = 10
  const gap = 2

  // 3x3 grid of modules
  const positions = [
    [4, 4],
    [16, 4],
    [28, 4],
    [4, 16],
    [16, 16],
    [28, 16],
    [4, 28],
    [16, 28],
    [28, 28],
  ]

  const getModulePath = (
    x: number,
    y: number,
    s: number,
    hasNeighbors: { top: boolean; right: boolean; bottom: boolean; left: boolean },
  ) => {
    const { top, right, bottom, left } = hasNeighbors
    const r = s * 0.25

    switch (shape) {
      case "square":
        return <rect x={x} y={y} width={s} height={s} />
      case "rounded": {
        const tl = !top && !left ? r : 0
        const tr = !top && !right ? r : 0
        const br = !bottom && !right ? r : 0
        const bl = !bottom && !left ? r : 0
        return <rect x={x} y={y} width={s} height={s} rx={Math.max(tl, tr, br, bl)} />
      }
      case "dots":
        return <circle cx={x + s / 2} cy={y + s / 2} r={s / 2} />
      case "dots-small":
        return <circle cx={x + s / 2} cy={y + s / 2} r={s * 0.35} />
      case "diamond":
        return <polygon points={`${x + s / 2},${y} ${x + s},${y + s / 2} ${x + s / 2},${y + s} ${x},${y + s / 2}`} />
      case "star": {
        const cx = x + s / 2
        const cy = y + s / 2
        const outer = s / 2
        const inner = s / 4
        const points = Array.from({ length: 10 }, (_, i) => {
          const angle = (i * Math.PI) / 5 - Math.PI / 2
          const rad = i % 2 === 0 ? outer : inner
          return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`
        }).join(" ")
        return <polygon points={points} />
      }
      case "hexagon": {
        const cx = x + s / 2
        const cy = y + s / 2
        const rad = s / 2
        const points = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * Math.PI) / 3 - Math.PI / 2
          return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`
        }).join(" ")
        return <polygon points={points} />
      }
      case "vertical-bars":
        return <rect x={x + s * 0.3} y={y} width={s * 0.4} height={s} rx={s * 0.1} />
      case "horizontal-bars":
        return <rect x={x} y={y + s * 0.3} width={s} height={s * 0.4} rx={s * 0.1} />
      case "rounded-vertical":
        return <rect x={x + s * 0.25} y={y} width={s * 0.5} height={s} rx={s * 0.25} />
      case "rounded-horizontal":
        return <rect x={x} y={y + s * 0.25} width={s} height={s * 0.5} rx={s * 0.25} />
      case "classy":
        return <path d={`M${x + s * 0.2},${y}h${s * 0.8}v${s * 0.8}l${-s * 0.2},${s * 0.2}h${-s * 0.8}v${-s * 0.8}Z`} />
      case "classy-rounded":
        return (
          <path
            d={`M${x + s * 0.25},${y}h${s * 0.6}a${s * 0.15},${s * 0.15} 0 0 1 ${s * 0.15},${s * 0.15}v${s * 0.6}l${-s * 0.15},${s * 0.15}h${-s * 0.6}a${s * 0.15},${s * 0.15} 0 0 1 ${-s * 0.15},${-s * 0.15}v${-s * 0.6}Z`}
          />
        )
      case "edge-cut": {
        const cut = s * 0.2
        return (
          <path
            d={`M${x + cut},${y}h${s - 2 * cut}l${cut},${cut}v${s - 2 * cut}l${-cut},${cut}h${-(s - 2 * cut)}l${-cut},${-cut}v${-(s - 2 * cut)}Z`}
          />
        )
      }
      case "edge-cut-smooth": {
        const cut = s * 0.15
        return (
          <path
            d={`M${x + cut},${y}h${s - 2 * cut}q${cut},0 ${cut},${cut}v${s - 2 * cut}q0,${cut} ${-cut},${cut}h${-(s - 2 * cut)}q${-cut},0 ${-cut},${-cut}v${-(s - 2 * cut)}q0,${-cut} ${cut},${-cut}Z`}
          />
        )
      }
      case "pointed": {
        const point = s * 0.15
        return (
          <path
            d={`M${x + s / 2},${y}l${s / 2 - point},${point}l${point},${s / 2 - point}l${-point},${s / 2 - point}l${-(s / 2 - point)},${point}l${-(s / 2 - point)},${-point}l${-point},${-(s / 2 - point)}l${point},${-(s / 2 - point)}Z`}
          />
        )
      }
      case "pointed-smooth": {
        const cx = x + s / 2
        const cy = y + s / 2
        const outer = s / 2
        const inner = s * 0.35
        const points = Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4 - Math.PI / 2
          const rad = i % 2 === 0 ? outer : inner
          return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`
        }).join(" ")
        return <polygon points={points} />
      }
      case "pointed-in":
        return <path d={`M${x + s / 2},${y}L${x + s},${y + s / 2}L${x + s / 2},${y + s}L${x},${y + s / 2}Z`} />
      case "pointed-in-smooth":
        return (
          <path
            d={`M${x + s / 2},${y}Q${x + s * 0.8},${y + s * 0.2} ${x + s},${y + s / 2}Q${x + s * 0.8},${y + s * 0.8} ${x + s / 2},${y + s}Q${x + s * 0.2},${y + s * 0.8} ${x},${y + s / 2}Q${x + s * 0.2},${y + s * 0.2} ${x + s / 2},${y}Z`}
          />
        )
      case "blob":
        return (
          <path
            d={`M${x + s / 2},${y + s * 0.1}Q${x + s * 0.9},${y + s * 0.15} ${x + s * 0.9},${y + s / 2}Q${x + s * 0.85},${y + s * 0.85} ${x + s / 2},${y + s * 0.9}Q${x + s * 0.1},${y + s * 0.85} ${x + s * 0.1},${y + s / 2}Q${x + s * 0.15},${y + s * 0.15} ${x + s / 2},${y + s * 0.1}Z`}
          />
        )
      default:
        return <rect x={x} y={y} width={s} height={s} />
    }
  }

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <g className="fill-foreground">
        {positions.map(([px, py], i) => {
          const row = Math.floor(i / 3)
          const col = i % 3
          const hasNeighbors = {
            top: row > 0,
            right: col < 2,
            bottom: row < 2,
            left: col > 0,
          }
          return <g key={i}>{getModulePath(px, py, moduleSize, hasNeighbors)}</g>
        })}
      </g>
    </svg>
  )
}

function EyeFrameShapePreview({ shape }: { shape: EyeFrameShape }) {
  const size = 32
  const t = size / 7
  const x = 4
  const y = 4

  const getFrame = () => {
    switch (shape) {
      case "square":
        return (
          <>
            <rect x={x} y={y} width={size} height={size} className="fill-foreground" />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} className="fill-card" />
          </>
        )
      case "rounded": {
        const r = size * 0.2
        return (
          <>
            <rect x={x} y={y} width={size} height={size} rx={r} className="fill-foreground" />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} rx={r * 0.5} className="fill-card" />
          </>
        )
      }
      case "rounded-sm": {
        const r = size * 0.1
        return (
          <>
            <rect x={x} y={y} width={size} height={size} rx={r} className="fill-foreground" />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} className="fill-card" />
          </>
        )
      }
      case "circle":
        return (
          <>
            <circle cx={x + size / 2} cy={y + size / 2} r={size / 2} className="fill-foreground" />
            <circle cx={x + size / 2} cy={y + size / 2} r={size / 2 - t} className="fill-card" />
          </>
        )
      case "rounded-heavy": {
        const r = size * 0.35
        return (
          <>
            <rect x={x} y={y} width={size} height={size} rx={r} className="fill-foreground" />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} className="fill-card" />
          </>
        )
      }
      case "dotted": {
        const dotR = t * 0.5
        const dots = []
        for (let i = 0; i < 5; i++) {
          const dx = x + t / 2 + (i * (size - t)) / 4
          dots.push(<circle key={`t${i}`} cx={dx} cy={y + t / 2} r={dotR} />)
          dots.push(<circle key={`b${i}`} cx={dx} cy={y + size - t / 2} r={dotR} />)
        }
        for (let i = 1; i < 4; i++) {
          const dy = y + t / 2 + (i * (size - t)) / 4
          dots.push(<circle key={`l${i}`} cx={x + t / 2} cy={dy} r={dotR} />)
          dots.push(<circle key={`r${i}`} cx={x + size - t / 2} cy={dy} r={dotR} />)
        }
        return <g className="fill-foreground">{dots}</g>
      }
      case "dotted-square": {
        const dotR = t * 0.4
        const dots = []
        for (let i = 0; i <= 6; i++) {
          const dx = x + (i * size) / 6
          dots.push(<circle key={`t${i}`} cx={dx} cy={y} r={dotR} />)
          dots.push(<circle key={`b${i}`} cx={dx} cy={y + size} r={dotR} />)
        }
        for (let i = 1; i < 6; i++) {
          const dy = y + (i * size) / 6
          dots.push(<circle key={`l${i}`} cx={x} cy={dy} r={dotR} />)
          dots.push(<circle key={`r${i}`} cx={x + size} cy={dy} r={dotR} />)
        }
        return <g className="fill-foreground">{dots}</g>
      }
      case "leaf": {
        const r = size * 0.3
        return (
          <>
            <rect x={x} y={y} width={size} height={size} rx={r} className="fill-foreground" />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} rx={r * 0.5} className="fill-card" />
          </>
        )
      }
      case "cushion": {
        const cx = x + size / 2
        const cy = y + size / 2
        return (
          <>
            <path
              d={`M${cx},${y}Q${x + size},${y} ${x + size},${cy}Q${x + size},${y + size} ${cx},${y + size}Q${x},${y + size} ${x},${cy}Q${x},${y} ${cx},${y}Z`}
              className="fill-foreground"
            />
            <path
              d={`M${cx},${y + t}Q${x + size - t},${y + t} ${x + size - t},${cy}Q${x + size - t},${y + size - t} ${cx},${y + size - t}Q${x + t},${y + size - t} ${x + t},${cy}Q${x + t},${y + t} ${cx},${y + t}Z`}
              className="fill-card"
            />
          </>
        )
      }
      case "pointed": {
        const point = size * 0.12
        return (
          <>
            <path
              d={`M${x + point},${y}h${size - 2 * point}l${point},${point}v${size - 2 * point}l${-point},${point}h${-(size - 2 * point)}l${-point},${-point}v${-(size - 2 * point)}Z`}
              className="fill-foreground"
            />
            <path
              d={`M${x + t + point},${y + t}h${size - 2 * t - 2 * point}l${point},${point}v${size - 2 * t - 2 * point}l${-point},${point}h${-(size - 2 * t - 2 * point)}l${-point},${-point}v${-(size - 2 * t - 2 * point)}Z`}
              className="fill-card"
            />
          </>
        )
      }
      case "inpoint":
        return (
          <>
            <rect x={x} y={y} width={size} height={size} className="fill-foreground" />
            <path
              d={`M${x + t},${y + t}v${size / 2 - t - 2}l3,3l-3,3v${size / 2 - t - 4}h${size / 2 - t - 2}l3,-3l3,3h${size / 2 - t - 4}v${-(size / 2 - t - 2)}l-3,-3l3,-3v${-(size / 2 - t - 4)}h${-(size / 2 - t - 2)}l-3,3l-3,-3Z`}
              className="fill-card"
            />
          </>
        )
      case "outpoint":
        return (
          <>
            <path
              d={`M${x + 4},${y}h${size / 2 - 6}l3,-3l3,3h${size / 2 - 6}l4,4v${size / 2 - 6}l3,3l-3,3v${size / 2 - 6}l-4,4h${-(size / 2 - 6)}l-3,3l-3,-3h${-(size / 2 - 6)}l-4,-4v${-(size / 2 - 6)}l-3,-3l3,-3v${-(size / 2 - 6)}Z`}
              className="fill-foreground"
            />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} className="fill-card" />
          </>
        )
      case "eye": {
        const rx = size / 2
        const ry = size * 0.35
        return (
          <>
            <ellipse cx={x + size / 2} cy={y + size / 2} rx={rx} ry={ry} className="fill-foreground" />
            <ellipse cx={x + size / 2} cy={y + size / 2} rx={rx - t} ry={ry - t * 0.7} className="fill-card" />
          </>
        )
      }
      case "shield":
        return (
          <>
            <path
              d={`M${x + size / 2},${y}h${size / 2}v${size * 0.6}q0,${size * 0.4} ${-size / 2},${size * 0.4}q${-size / 2},0 ${-size / 2},${-size * 0.4}v${-size * 0.6}Z`}
              className="fill-foreground"
            />
            <path
              d={`M${x + size / 2},${y + t}h${size / 2 - t}v${size * 0.5}q0,${size * 0.3} ${-(size / 2 - t)},${size * 0.35}q${-(size / 2 - t)},${-0.05 * size} ${-(size / 2 - t)},${-size * 0.35}v${-size * 0.5}Z`}
              className="fill-card"
            />
          </>
        )
      case "double": {
        const gap = t * 0.3
        const th = t - gap
        return (
          <>
            <rect x={x} y={y} width={size} height={th} rx={th / 2} className="fill-foreground" />
            <rect x={x} y={y + size - th} width={size} height={th} rx={th / 2} className="fill-foreground" />
            <rect x={x} y={y + t} width={th} height={size - 2 * t} rx={th / 2} className="fill-foreground" />
            <rect
              x={x + size - th}
              y={y + t}
              width={th}
              height={size - 2 * t}
              rx={th / 2}
              className="fill-foreground"
            />
          </>
        )
      }
      default:
        return (
          <>
            <rect x={x} y={y} width={size} height={size} className="fill-foreground" />
            <rect x={x + t} y={y + t} width={size - 2 * t} height={size - 2 * t} className="fill-card" />
          </>
        )
    }
  }

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {getFrame()}
    </svg>
  )
}

function EyeBallShapePreview({ shape }: { shape: EyeBallShape }) {
  const size = 20
  const x = 10
  const y = 10

  const getBall = () => {
    switch (shape) {
      case "square":
        return <rect x={x} y={y} width={size} height={size} />
      case "rounded":
        return <rect x={x} y={y} width={size} height={size} rx={size * 0.25} />
      case "rounded-sm":
        return <rect x={x} y={y} width={size} height={size} rx={size * 0.15} />
      case "circle":
        return <circle cx={x + size / 2} cy={y + size / 2} r={size / 2} />
      case "dots": {
        const r = size * 0.18
        const gap = size * 0.14
        return (
          <>
            <circle cx={x + gap + r} cy={y + gap + r} r={r} />
            <circle cx={x + size - gap - r} cy={y + gap + r} r={r} />
            <circle cx={x + gap + r} cy={y + size - gap - r} r={r} />
            <circle cx={x + size - gap - r} cy={y + size - gap - r} r={r} />
          </>
        )
      }
      case "clover": {
        const r = size * 0.28
        const offset = size * 0.22
        return (
          <>
            <circle cx={x + offset} cy={y + offset} r={r} />
            <circle cx={x + size - offset} cy={y + offset} r={r} />
            <circle cx={x + offset} cy={y + size - offset} r={r} />
            <circle cx={x + size - offset} cy={y + size - offset} r={r} />
          </>
        )
      }
      case "diamond":
        return (
          <polygon
            points={`${x + size / 2},${y} ${x + size},${y + size / 2} ${x + size / 2},${y + size} ${x},${y + size / 2}`}
          />
        )
      case "leaf":
        return <rect x={x} y={y} width={size} height={size} rx={size * 0.35} />
      case "shield":
        return (
          <path
            d={`M${x + size / 2},${y}h${size / 2}v${size * 0.6}q0,${size * 0.4} ${-size / 2},${size * 0.4}q${-size / 2},0 ${-size / 2},${-size * 0.4}v${-size * 0.6}Z`}
          />
        )
      case "star": {
        const cx = x + size / 2
        const cy = y + size / 2
        const outer = size / 2
        const inner = size / 4
        const points = Array.from({ length: 10 }, (_, i) => {
          const angle = (i * Math.PI) / 5 - Math.PI / 2
          const r = i % 2 === 0 ? outer : inner
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(" ")
        return <polygon points={points} />
      }
      case "cross": {
        const arm = size / 3
        return (
          <path
            d={`M${x + arm},${y}h${arm}v${arm}h${arm}v${arm}h${-arm}v${arm}h${-arm}v${-arm}h${-arm}v${-arm}h${arm}Z`}
          />
        )
      }
      case "bars-vertical": {
        const w = size * 0.22
        const gap = (size - 3 * w) / 4
        return (
          <>
            <rect x={x + gap} y={y} width={w} height={size} rx={w / 4} />
            <rect x={x + 2 * gap + w} y={y} width={w} height={size} rx={w / 4} />
            <rect x={x + 3 * gap + 2 * w} y={y} width={w} height={size} rx={w / 4} />
          </>
        )
      }
      case "bars-horizontal": {
        const h = size * 0.22
        const gap = (size - 3 * h) / 4
        return (
          <>
            <rect x={x} y={y + gap} width={size} height={h} rx={h / 4} />
            <rect x={x} y={y + 2 * gap + h} width={size} height={h} rx={h / 4} />
            <rect x={x} y={y + 3 * gap + 2 * h} width={size} height={h} rx={h / 4} />
          </>
        )
      }
      case "pointed": {
        const cx = x + size / 2
        const cy = y + size / 2
        const outer = size / 2
        const inner = size * 0.3
        const points = Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4 - Math.PI / 2
          const r = i % 2 === 0 ? outer : inner
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(" ")
        return <polygon points={points} />
      }
      case "blob":
        return (
          <path
            d={`M${x + size / 2},${y + size * 0.1}Q${x + size * 0.9},${y + size * 0.15} ${x + size * 0.9},${y + size / 2}Q${x + size * 0.85},${y + size * 0.85} ${x + size / 2},${y + size * 0.9}Q${x + size * 0.1},${y + size * 0.85} ${x + size * 0.1},${y + size / 2}Q${x + size * 0.15},${y + size * 0.15} ${x + size / 2},${y + size * 0.1}Z`}
          />
        )
      case "rhombus": {
        const inset = size * 0.1
        return (
          <polygon
            points={`${x + size / 2},${y + inset} ${x + size - inset},${y + size / 2} ${x + size / 2},${y + size - inset} ${x + inset},${y + size / 2}`}
          />
        )
      }
      case "gear": {
        const cx = x + size / 2
        const cy = y + size / 2
        const outer = size / 2
        const inner = size * 0.35
        const points = Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI) / 6 - Math.PI / 2
          const r = i % 2 === 0 ? outer : inner
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(" ")
        return <polygon points={points} />
      }
      default:
        return <rect x={x} y={y} width={size} height={size} />
    }
  }

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <g className="fill-foreground">{getBall()}</g>
    </svg>
  )
}
