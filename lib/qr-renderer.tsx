// QR Code SVG and Canvas rendering with custom shapes
import type { QRMatrix } from "./qr-generator"
import type { BodyShape, EyeFrameShape, EyeBallShape } from "./qr-shapes"

export interface GradientConfig {
  enabled: boolean
  type: "linear" | "radial"
  direction: number
  colors: [string, string]
}

export interface QRStyleConfig {
  bodyShape: BodyShape
  eyeFrameShape: EyeFrameShape
  eyeBallShape: EyeBallShape
  bodyColor: string
  eyeFrameColor: string
  eyeBallColor: string
  backgroundColor: string
  backgroundTransparent: boolean
  bodyGradient: GradientConfig
  eyeFrameGradient: GradientConfig
  eyeBallGradient: GradientConfig
  moduleSize: number
  padding: number
}

export const defaultStyleConfig: QRStyleConfig = {
  bodyShape: "square",
  eyeFrameShape: "square",
  eyeBallShape: "square",
  bodyColor: "#000000",
  eyeFrameColor: "#000000",
  eyeBallColor: "#000000",
  backgroundColor: "#ffffff",
  backgroundTransparent: false,
  bodyGradient: { enabled: false, type: "linear", direction: 45, colors: ["#000000", "#333333"] },
  eyeFrameGradient: { enabled: false, type: "linear", direction: 45, colors: ["#000000", "#333333"] },
  eyeBallGradient: { enabled: false, type: "linear", direction: 45, colors: ["#000000", "#333333"] },
  moduleSize: 10,
  padding: 4,
}

// Eye pattern positions - these mark the finder patterns
function isFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true
  // Top-right finder
  if (row < 7 && col >= size - 7) return true
  // Bottom-left finder
  if (row >= size - 7 && col < 7) return true
  return false
}

function isEyeFrame(row: number, col: number, size: number): boolean {
  // Top-left eye frame
  if (row < 7 && col < 7) {
    if (row === 0 || row === 6 || col === 0 || col === 6) return true
    if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
      if (row === 1 || row === 5 || col === 1 || col === 5) return true
    }
    return false
  }
  // Top-right eye frame
  if (row < 7 && col >= size - 7) {
    const localCol = col - (size - 7)
    if (row === 0 || row === 6 || localCol === 0 || localCol === 6) return true
    if (row >= 1 && row <= 5 && localCol >= 1 && localCol <= 5) {
      if (row === 1 || row === 5 || localCol === 1 || localCol === 5) return true
    }
    return false
  }
  // Bottom-left eye frame
  if (row >= size - 7 && col < 7) {
    const localRow = row - (size - 7)
    if (localRow === 0 || localRow === 6 || col === 0 || col === 6) return true
    if (localRow >= 1 && localRow <= 5 && col >= 1 && col <= 5) {
      if (localRow === 1 || localRow === 5 || col === 1 || col === 5) return true
    }
    return false
  }
  return false
}

function isEyeBall(row: number, col: number, size: number): boolean {
  // Top-left eye ball (center 3x3)
  if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true
  // Top-right eye ball
  if (row >= 2 && row <= 4 && col >= size - 5 && col <= size - 3) return true
  // Bottom-left eye ball
  if (row >= size - 5 && row <= size - 3 && col >= 2 && col <= 4) return true
  return false
}

function getNeighbors(
  matrix: boolean[][],
  row: number,
  col: number,
): {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
  topLeft: boolean
  topRight: boolean
  bottomLeft: boolean
  bottomRight: boolean
} {
  const size = matrix.length
  return {
    top: row > 0 && matrix[row - 1][col],
    right: col < size - 1 && matrix[row][col + 1],
    bottom: row < size - 1 && matrix[row + 1][col],
    left: col > 0 && matrix[row][col - 1],
    topLeft: row > 0 && col > 0 && matrix[row - 1][col - 1],
    topRight: row > 0 && col < size - 1 && matrix[row - 1][col + 1],
    bottomLeft: row < size - 1 && col > 0 && matrix[row + 1][col - 1],
    bottomRight: row < size - 1 && col < size - 1 && matrix[row + 1][col + 1],
  }
}

function getBodyPath(
  shape: BodyShape,
  x: number,
  y: number,
  s: number,
  neighbors: ReturnType<typeof getNeighbors>,
): string {
  const { top, right, bottom, left } = neighbors
  const r = s * 0.25

  switch (shape) {
    case "square":
      return `M${x},${y}h${s}v${s}h${-s}Z`

    case "rounded": {
      const tl = !top && !left ? r : 0
      const tr = !top && !right ? r : 0
      const br = !bottom && !right ? r : 0
      const bl = !bottom && !left ? r : 0
      return (
        `M${x + tl},${y}` +
        `h${s - tl - tr}` +
        (tr > 0 ? `a${tr},${tr} 0 0 1 ${tr},${tr}` : ``) +
        `v${s - tr - br}` +
        (br > 0 ? `a${br},${br} 0 0 1 ${-br},${br}` : ``) +
        `h${-(s - br - bl)}` +
        (bl > 0 ? `a${bl},${bl} 0 0 1 ${-bl},${-bl}` : ``) +
        `v${-(s - bl - tl)}` +
        (tl > 0 ? `a${tl},${tl} 0 0 1 ${tl},${-tl}` : ``) +
        `Z`
      )
    }

    case "dots":
      return `M${x + s / 2},${y}a${s / 2},${s / 2} 0 1 1 0,${s}a${s / 2},${s / 2} 0 1 1 0,${-s}`

    case "dots-small":
      return `M${x + s / 2},${y + s * 0.15}a${s * 0.35},${s * 0.35} 0 1 1 0,${s * 0.7}a${s * 0.35},${s * 0.35} 0 1 1 0,${-s * 0.7}`

    case "diamond": {
      const cx = x + s / 2
      const cy = y + s / 2
      return `M${cx},${y}L${x + s},${cy}L${cx},${y + s}L${x},${cy}Z`
    }

    case "star": {
      const cx = x + s / 2
      const cy = y + s / 2
      const outer = s / 2
      const inner = s / 4
      let path = ""
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const rad = i % 2 === 0 ? outer : inner
        const px = cx + rad * Math.cos(angle)
        const py = cy + rad * Math.sin(angle)
        path += (i === 0 ? "M" : "L") + `${px},${py}`
      }
      return path + "Z"
    }

    case "hexagon": {
      const cx = x + s / 2
      const cy = y + s / 2
      const rad = s / 2
      let path = ""
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2
        const px = cx + rad * Math.cos(angle)
        const py = cy + rad * Math.sin(angle)
        path += (i === 0 ? "M" : "L") + `${px},${py}`
      }
      return path + "Z"
    }

    case "vertical-bars":
      return `M${x + s * 0.3},${y}h${s * 0.4}v${s}h${-s * 0.4}Z`

    case "horizontal-bars":
      return `M${x},${y + s * 0.3}h${s}v${s * 0.4}h${-s}Z`

    case "rounded-vertical": {
      const w = s * 0.4
      const rx = w / 2
      return `M${x + s * 0.3 + rx},${y}h${w - 2 * rx}a${rx},${rx} 0 0 1 ${rx},${rx}v${s - 2 * rx}a${rx},${rx} 0 0 1 ${-rx},${rx}h${-(w - 2 * rx)}a${rx},${rx} 0 0 1 ${-rx},${-rx}v${-(s - 2 * rx)}a${rx},${rx} 0 0 1 ${rx},${-rx}Z`
    }

    case "rounded-horizontal": {
      const h = s * 0.4
      const ry = h / 2
      return `M${x},${y + s * 0.3 + ry}v${h - 2 * ry}a${ry},${ry} 0 0 0 ${ry},${ry}h${s - 2 * ry}a${ry},${ry} 0 0 0 ${ry},${-ry}v${-(h - 2 * ry)}a${ry},${ry} 0 0 0 ${-ry},${-ry}h${-(s - 2 * ry)}a${ry},${ry} 0 0 0 ${-ry},${ry}Z`
    }

    case "classy": {
      const cut = s * 0.25
      return `M${x + cut},${y}h${s - cut}v${s - cut}l${-cut},${cut}h${-(s - cut)}v${-(s - cut)}Z`
    }

    case "classy-rounded": {
      const cut = s * 0.25
      const cr = s * 0.1
      return `M${x + cut + cr},${y}h${s - cut - 2 * cr}a${cr},${cr} 0 0 1 ${cr},${cr}v${s - cut - 2 * cr}l${-cut},${cut}h${-(s - cut - cr)}a${cr},${cr} 0 0 1 ${-cr},${-cr}v${-(s - cut - 2 * cr)}a${cr},${cr} 0 0 1 ${cr},${-cr}Z`
    }

    case "edge-cut": {
      const cut = s * 0.2
      return `M${x + cut},${y}h${s - 2 * cut}l${cut},${cut}v${s - 2 * cut}l${-cut},${cut}h${-(s - 2 * cut)}l${-cut},${-cut}v${-(s - 2 * cut)}Z`
    }

    case "edge-cut-smooth": {
      const cut = s * 0.2
      const cr = cut * 0.5
      return `M${x + cut},${y}h${s - 2 * cut}q${cut},0 ${cut},${cut}v${s - 2 * cut}q0,${cut} ${-cut},${cut}h${-(s - 2 * cut)}q${-cut},0 ${-cut},${-cut}v${-(s - 2 * cut)}q0,${-cut} ${cut},${-cut}Z`
    }

    case "pointed": {
      const point = s * 0.2
      const cx = x + s / 2
      return `M${cx},${y}l${s / 2 - point},${point}l${point},${s / 2 - point}l${-point},${s / 2 - point}l${-(s / 2 - point)},${point}l${-(s / 2 - point)},${-point}l${-point},${-(s / 2 - point)}l${point},${-(s / 2 - point)}Z`
    }

    case "pointed-smooth": {
      const cx = x + s / 2
      const cy = y + s / 2
      const outer = s / 2
      const inner = s * 0.35
      let path = ""
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 2
        const rad = i % 2 === 0 ? outer : inner
        const px = cx + rad * Math.cos(angle)
        const py = cy + rad * Math.sin(angle)
        path += (i === 0 ? "M" : "L") + `${px},${py}`
      }
      return path + "Z"
    }

    case "pointed-in": {
      const indent = s * 0.15
      const cx = x + s / 2
      return (
        `M${cx},${y}L${x + s},${y + s / 2}L${cx},${y + s}L${x},${y + s / 2}Z` +
        `M${cx},${y + indent}L${x + s - indent},${y + s / 2}L${cx},${y + s - indent}L${x + indent},${y + s / 2}Z`
      )
    }

    case "pointed-in-smooth": {
      const cx = x + s / 2
      const cy = y + s / 2
      const rad = s / 2
      return `M${cx},${y}Q${x + s * 0.7},${y + s * 0.3} ${x + s},${cy}Q${x + s * 0.7},${y + s * 0.7} ${cx},${y + s}Q${x + s * 0.3},${y + s * 0.7} ${x},${cy}Q${x + s * 0.3},${y + s * 0.3} ${cx},${y}Z`
    }

    case "blob": {
      const cx = x + s / 2
      const cy = y + s / 2
      const rad = s * 0.45
      return `M${cx},${y + s * 0.1}Q${x + s * 0.85},${y + s * 0.1} ${x + s * 0.9},${cy}Q${x + s * 0.85},${y + s * 0.9} ${cx},${y + s * 0.9}Q${x + s * 0.1},${y + s * 0.85} ${x + s * 0.1},${cy}Q${x + s * 0.15},${y + s * 0.15} ${cx},${y + s * 0.1}Z`
    }

    default:
      return `M${x},${y}h${s}v${s}h${-s}Z`
  }
}

function getEyeFrameSVG(shape: EyeFrameShape, x: number, y: number, size: number): string {
  const s = size
  const t = size / 7 // frame thickness

  switch (shape) {
    case "square":
      return `<path d="M${x},${y}h${s}v${s}h${-s}Z M${x + t},${y + t}v${s - 2 * t}h${s - 2 * t}v${-(s - 2 * t)}Z" fill-rule="evenodd"/>`

    case "rounded": {
      const r = s * 0.2
      const ri = s * 0.1
      return `<path d="M${x + r},${y}h${s - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${s - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(s - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(s - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${x + t + ri},${y + t}h${s - 2 * t - 2 * ri}a${ri},${ri} 0 0 1 ${ri},${ri}v${s - 2 * t - 2 * ri}a${ri},${ri} 0 0 1 ${-ri},${ri}h${-(s - 2 * t - 2 * ri)}a${ri},${ri} 0 0 1 ${-ri},${-ri}v${-(s - 2 * t - 2 * ri)}a${ri},${ri} 0 0 1 ${ri},${-ri}Z" fill-rule="evenodd"/>`
    }

    case "rounded-sm": {
      const r = s * 0.1
      return `<path d="M${x + r},${y}h${s - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${s - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(s - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(s - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${x + t},${y + t}v${s - 2 * t}h${s - 2 * t}v${-(s - 2 * t)}Z" fill-rule="evenodd"/>`
    }

    case "circle": {
      const cx = x + s / 2
      const cy = y + s / 2
      const r1 = s / 2
      const r2 = s / 2 - t
      return `<circle cx="${cx}" cy="${cy}" r="${r1}"/><circle cx="${cx}" cy="${cy}" r="${r2}" fill="var(--bg-color, white)"/>`
    }

    case "rounded-heavy": {
      const r = s * 0.35
      return `<path d="M${x + r},${y}h${s - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${s - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(s - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(s - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z M${x + t},${y + t}v${s - 2 * t}h${s - 2 * t}v${-(s - 2 * t)}Z" fill-rule="evenodd"/>`
    }

    case "dotted": {
      const dotR = t * 0.6
      const dots: string[] = []
      const numDots = 5
      const spacing = (s - 2 * t) / (numDots - 1)

      for (let i = 0; i < numDots; i++) {
        const dx = x + t + i * spacing
        dots.push(`<circle cx="${dx}" cy="${y + t / 2}" r="${dotR}"/>`)
        dots.push(`<circle cx="${dx}" cy="${y + s - t / 2}" r="${dotR}"/>`)
      }
      for (let i = 1; i < numDots - 1; i++) {
        const dy = y + t + i * spacing
        dots.push(`<circle cx="${x + t / 2}" cy="${dy}" r="${dotR}"/>`)
        dots.push(`<circle cx="${x + s - t / 2}" cy="${dy}" r="${dotR}"/>`)
      }
      return dots.join("")
    }

    case "dotted-square": {
      const dotR = t * 0.5
      const dots: string[] = []
      const numDots = 7
      const spacing = s / (numDots - 1)

      for (let i = 0; i < numDots; i++) {
        const dx = x + i * spacing
        dots.push(`<circle cx="${dx}" cy="${y}" r="${dotR}"/>`)
        dots.push(`<circle cx="${dx}" cy="${y + s}" r="${dotR}"/>`)
      }
      for (let i = 1; i < numDots - 1; i++) {
        const dy = y + i * spacing
        dots.push(`<circle cx="${x}" cy="${dy}" r="${dotR}"/>`)
        dots.push(`<circle cx="${x + s}" cy="${dy}" r="${dotR}"/>`)
      }
      return dots.join("")
    }

    case "leaf": {
      const r = s * 0.3
      return `<path d="M${x},${y + r}a${r},${r} 0 0 1 ${r},${-r}h${s - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${s - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(s - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}Z M${x + t},${y + t}v${s - 2 * t}h${s - 2 * t}v${-(s - 2 * t)}Z" fill-rule="evenodd"/>`
    }

    case "cushion": {
      const cx = x + s / 2
      const cy = y + s / 2
      return `<path d="M${cx},${y}Q${x + s},${y} ${x + s},${cy}Q${x + s},${y + s} ${cx},${y + s}Q${x},${y + s} ${x},${cy}Q${x},${y} ${cx},${y}Z M${cx},${y + t}Q${x + s - t},${y + t} ${x + s - t},${cy}Q${x + s - t},${y + s - t} ${cx},${y + s - t}Q${x + t},${y + s - t} ${x + t},${cy}Q${x + t},${y + t} ${cx},${y + t}Z" fill-rule="evenodd"/>`
    }

    case "pointed": {
      const point = s * 0.15
      return `<path d="M${x + point},${y}h${s - 2 * point}l${point},${point}v${s - 2 * point}l${-point},${point}h${-(s - 2 * point)}l${-point},${-point}v${-(s - 2 * point)}Z M${x + t + point},${y + t}h${s - 2 * t - 2 * point}l${point},${point}v${s - 2 * t - 2 * point}l${-point},${point}h${-(s - 2 * t - 2 * point)}l${-point},${-point}v${-(s - 2 * t - 2 * point)}Z" fill-rule="evenodd"/>`
    }

    case "inpoint": {
      const indent = s * 0.1
      return `<path d="M${x},${y}h${s}v${s}h${-s}Z M${x + t},${y + t}v${(s - 2 * t) / 2 - indent}l${indent},${indent}l${-indent},${indent}v${(s - 2 * t) / 2 - indent}h${(s - 2 * t) / 2 - indent}l${indent},${-indent}l${indent},${indent}h${(s - 2 * t) / 2 - indent}v${-((s - 2 * t) / 2 - indent)}l${-indent},${-indent}l${indent},${-indent}v${-((s - 2 * t) / 2 - indent)}h${-((s - 2 * t) / 2 - indent)}l${-indent},${indent}l${-indent},${-indent}Z" fill-rule="evenodd"/>`
    }

    case "outpoint": {
      const point = s * 0.1
      return `<path d="M${x + point},${y}h${(s - 2 * point) / 2 - point}l${point},${-point}l${point},${point}h${(s - 2 * point) / 2 - point}l${point},${point}v${(s - 2 * point) / 2 - point}l${point},${point}l${-point},${point}v${(s - 2 * point) / 2 - point}l${-point},${point}h${-((s - 2 * point) / 2 - point)}l${-point},${point}l${-point},${-point}h${-((s - 2 * point) / 2 - point)}l${-point},${-point}v${-((s - 2 * point) / 2 - point)}l${-point},${-point}l${point},${-point}v${-((s - 2 * point) / 2 - point)}Z M${x + t},${y + t}v${s - 2 * t}h${s - 2 * t}v${-(s - 2 * t)}Z" fill-rule="evenodd"/>`
    }

    case "eye": {
      const cx = x + s / 2
      const cy = y + s / 2
      const rx = s / 2
      const ry = s * 0.35
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - t}" ry="${ry - t * 0.7}" fill="var(--bg-color, white)"/>`
    }

    case "shield": {
      return `<path d="M${x + s / 2},${y}h${s / 2}v${s * 0.6}q0,${s * 0.4} ${-s / 2},${s * 0.4}q${-s / 2},0 ${-s / 2},${-s * 0.4}v${-s * 0.6}Z M${x + s / 2},${y + t}h${s / 2 - t}v${s * 0.5}q0,${s * 0.35} ${-(s / 2 - t)},${s * 0.35}q${-(s / 2 - t)},0 ${-(s / 2 - t)},${-s * 0.35}v${-s * 0.5}Z" fill-rule="evenodd"/>`
    }

    case "double": {
      const gap = t * 0.3
      return (
        `<rect x="${x}" y="${y}" width="${s}" height="${t - gap}" rx="${(t - gap) / 2}"/>` +
        `<rect x="${x}" y="${y + s - t + gap}" width="${s}" height="${t - gap}" rx="${(t - gap) / 2}"/>` +
        `<rect x="${x}" y="${y + t}" width="${t - gap}" height="${s - 2 * t}" rx="${(t - gap) / 2}"/>` +
        `<rect x="${x + s - t + gap}" y="${y + t}" width="${t - gap}" height="${s - 2 * t}" rx="${(t - gap) / 2}"/>`
      )
    }

    default:
      return `<path d="M${x},${y}h${s}v${s}h${-s}Z M${x + t},${y + t}v${s - 2 * t}h${s - 2 * t}v${-(s - 2 * t)}Z" fill-rule="evenodd"/>`
  }
}

function getEyeBallSVG(shape: EyeBallShape, x: number, y: number, size: number): string {
  const s = size

  switch (shape) {
    case "square":
      return `<rect x="${x}" y="${y}" width="${s}" height="${s}"/>`

    case "rounded": {
      const r = s * 0.25
      return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}"/>`
    }

    case "rounded-sm": {
      const r = s * 0.15
      return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}"/>`
    }

    case "circle":
      return `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s / 2}"/>`

    case "dots": {
      const gap = s * 0.1
      const dotR = (s - 2 * gap) / 6
      const dots: string[] = []
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const cx = x + dotR + gap + i * (s / 2)
          const cy = y + dotR + gap + j * (s / 2)
          dots.push(`<circle cx="${cx}" cy="${cy}" r="${dotR}"/>`)
        }
      }
      return dots.join("")
    }

    case "clover": {
      const r = s * 0.28
      const offset = s * 0.22
      return (
        `<circle cx="${x + offset}" cy="${y + offset}" r="${r}"/>` +
        `<circle cx="${x + s - offset}" cy="${y + offset}" r="${r}"/>` +
        `<circle cx="${x + offset}" cy="${y + s - offset}" r="${r}"/>` +
        `<circle cx="${x + s - offset}" cy="${y + s - offset}" r="${r}"/>`
      )
    }

    case "diamond": {
      const cx = x + s / 2
      const cy = y + s / 2
      return `<path d="M${cx},${y}L${x + s},${cy}L${cx},${y + s}L${x},${cy}Z"/>`
    }

    case "leaf": {
      const r = s * 0.35
      return `<path d="M${x},${y + r}a${r},${r} 0 0 1 ${r},${-r}h${s - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${s - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(s - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}Z"/>`
    }

    case "shield": {
      return `<path d="M${x + s / 2},${y}h${s / 2}v${s * 0.6}q0,${s * 0.4} ${-s / 2},${s * 0.4}q${-s / 2},0 ${-s / 2},${-s * 0.4}v${-s * 0.6}Z"/>`
    }

    case "star": {
      const cx = x + s / 2
      const cy = y + s / 2
      const outer = s / 2
      const inner = s / 4
      let path = ""
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const r = i % 2 === 0 ? outer : inner
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        path += (i === 0 ? "M" : "L") + `${px},${py}`
      }
      return `<path d="${path}Z"/>`
    }

    case "cross": {
      const arm = s / 3
      return `<path d="M${x + arm},${y}h${arm}v${arm}h${arm}v${arm}h${-arm}v${arm}h${-arm}v${-arm}h${-arm}v${-arm}h${arm}Z"/>`
    }

    case "bars-vertical": {
      const w = s * 0.25
      const gap = (s - 3 * w) / 4
      return (
        `<rect x="${x + gap}" y="${y}" width="${w}" height="${s}" rx="${w / 4}"/>` +
        `<rect x="${x + 2 * gap + w}" y="${y}" width="${w}" height="${s}" rx="${w / 4}"/>` +
        `<rect x="${x + 3 * gap + 2 * w}" y="${y}" width="${w}" height="${s}" rx="${w / 4}"/>`
      )
    }

    case "bars-horizontal": {
      const h = s * 0.25
      const gap = (s - 3 * h) / 4
      return (
        `<rect x="${x}" y="${y + gap}" width="${s}" height="${h}" rx="${h / 4}"/>` +
        `<rect x="${x}" y="${y + 2 * gap + h}" width="${s}" height="${h}" rx="${h / 4}"/>` +
        `<rect x="${x}" y="${y + 3 * gap + 2 * h}" width="${s}" height="${h}" rx="${h / 4}"/>`
      )
    }

    case "pointed": {
      const cx = x + s / 2
      const cy = y + s / 2
      const outer = s / 2
      const inner = s * 0.3
      let path = ""
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 2
        const r = i % 2 === 0 ? outer : inner
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        path += (i === 0 ? "M" : "L") + `${px},${py}`
      }
      return `<path d="${path}Z"/>`
    }

    case "blob": {
      const cx = x + s / 2
      const cy = y + s / 2
      return `<path d="M${cx},${y + s * 0.1}Q${x + s * 0.9},${y + s * 0.15} ${x + s * 0.9},${cy}Q${x + s * 0.85},${y + s * 0.85} ${cx},${y + s * 0.9}Q${x + s * 0.1},${y + s * 0.85} ${x + s * 0.1},${cy}Q${x + s * 0.15},${y + s * 0.15} ${cx},${y + s * 0.1}Z"/>`
    }

    case "rhombus": {
      const inset = s * 0.1
      const cx = x + s / 2
      const cy = y + s / 2
      return `<path d="M${cx},${y + inset}L${x + s - inset},${cy}L${cx},${y + s - inset}L${x + inset},${cy}Z"/>`
    }

    case "gear": {
      const cx = x + s / 2
      const cy = y + s / 2
      const outer = s / 2
      const inner = s * 0.35
      let path = ""
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 - Math.PI / 2
        const r = i % 2 === 0 ? outer : inner
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        path += (i === 0 ? "M" : "L") + `${px},${py}`
      }
      return `<path d="${path}Z"/>`
    }

    default:
      return `<rect x="${x}" y="${y}" width="${s}" height="${s}"/>`
  }
}

export function renderQRCodeToSVG(matrix: QRMatrix, config: QRStyleConfig): string {
  if (!matrix.modules.length) return ""

  const { moduleSize: ms, padding } = config
  const qrSize = matrix.size
  const totalSize = (qrSize + padding * 2) * ms
  const offset = padding * ms

  // Create gradient definitions
  let defs = "<defs>"

  if (config.bodyGradient.enabled) {
    const g = config.bodyGradient
    if (g.type === "linear") {
      const angle = (g.direction * Math.PI) / 180
      const x1 = 50 - Math.cos(angle) * 50
      const y1 = 50 - Math.sin(angle) * 50
      const x2 = 50 + Math.cos(angle) * 50
      const y2 = 50 + Math.sin(angle) * 50
      defs += `<linearGradient id="bodyGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${g.colors[0]}"/><stop offset="100%" stop-color="${g.colors[1]}"/></linearGradient>`
    } else {
      defs += `<radialGradient id="bodyGrad"><stop offset="0%" stop-color="${g.colors[0]}"/><stop offset="100%" stop-color="${g.colors[1]}"/></radialGradient>`
    }
  }

  if (config.eyeFrameGradient.enabled) {
    const g = config.eyeFrameGradient
    if (g.type === "linear") {
      const angle = (g.direction * Math.PI) / 180
      const x1 = 50 - Math.cos(angle) * 50
      const y1 = 50 - Math.sin(angle) * 50
      const x2 = 50 + Math.cos(angle) * 50
      const y2 = 50 + Math.sin(angle) * 50
      defs += `<linearGradient id="eyeFrameGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${g.colors[0]}"/><stop offset="100%" stop-color="${g.colors[1]}"/></linearGradient>`
    } else {
      defs += `<radialGradient id="eyeFrameGrad"><stop offset="0%" stop-color="${g.colors[0]}"/><stop offset="100%" stop-color="${g.colors[1]}"/></radialGradient>`
    }
  }

  if (config.eyeBallGradient.enabled) {
    const g = config.eyeBallGradient
    if (g.type === "linear") {
      const angle = (g.direction * Math.PI) / 180
      const x1 = 50 - Math.cos(angle) * 50
      const y1 = 50 - Math.sin(angle) * 50
      const x2 = 50 + Math.cos(angle) * 50
      const y2 = 50 + Math.sin(angle) * 50
      defs += `<linearGradient id="eyeBallGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${g.colors[0]}"/><stop offset="100%" stop-color="${g.colors[1]}"/></linearGradient>`
    } else {
      defs += `<radialGradient id="eyeBallGrad"><stop offset="0%" stop-color="${g.colors[0]}"/><stop offset="100%" stop-color="${g.colors[1]}"/></radialGradient>`
    }
  }

  defs += "</defs>"

  const bgColor = config.backgroundTransparent ? "transparent" : config.backgroundColor
  const bodyFill = config.bodyGradient.enabled ? "url(#bodyGrad)" : config.bodyColor
  const eyeFrameFill = config.eyeFrameGradient.enabled ? "url(#eyeFrameGrad)" : config.eyeFrameColor
  const eyeBallFill = config.eyeBallGradient.enabled ? "url(#eyeBallGrad)" : config.eyeBallColor

  // Build body paths (excluding finder patterns)
  let bodyPath = ""
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (!matrix.modules[row][col]) continue
      if (isFinderPattern(row, col, qrSize)) continue

      const x = offset + col * ms
      const y = offset + row * ms
      const neighbors = getNeighbors(matrix.modules, row, col)
      bodyPath += getBodyPath(config.bodyShape, x, y, ms, neighbors)
    }
  }

  // Eye positions
  const eyePositions = [
    { x: offset, y: offset }, // top-left
    { x: offset + (qrSize - 7) * ms, y: offset }, // top-right
    { x: offset, y: offset + (qrSize - 7) * ms }, // bottom-left
  ]

  const frameSize = 7 * ms
  const ballSize = 3 * ms
  const ballOffset = 2 * ms

  let eyeFrames = ""
  let eyeBalls = ""

  eyePositions.forEach(({ x, y }) => {
    eyeFrames += getEyeFrameSVG(config.eyeFrameShape, x, y, frameSize)
    eyeBalls += getEyeBallSVG(config.eyeBallShape, x + ballOffset, y + ballOffset, ballSize)
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
    ${defs}
    <style>:root{--bg-color:${bgColor}}</style>
    <rect width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>
    <g fill="${bodyFill}"><path d="${bodyPath}"/></g>
    <g fill="${eyeFrameFill}">${eyeFrames}</g>
    <g fill="${eyeBallFill}">${eyeBalls}</g>
  </svg>`
}

export function renderQRCodeToCanvas(matrix: QRMatrix, config: QRStyleConfig, resolution: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = resolution
  canvas.height = resolution

  const ctx = canvas.getContext("2d")!

  // Get the SVG and render it to canvas
  const svgString = renderQRCodeToSVG(matrix, config)
  const img = new Image()
  img.crossOrigin = "anonymous"

  // Create a blob from the SVG string
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  return new Promise<HTMLCanvasElement>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, resolution, resolution)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.src = url
  }) as unknown as HTMLCanvasElement
}

// Synchronous canvas rendering for download
export function renderQRCodeToCanvasSync(
  matrix: QRMatrix,
  config: QRStyleConfig,
  resolution: number,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext("2d")!

    const svgString = renderQRCodeToSVG(matrix, config)
    const img = new Image()
    img.crossOrigin = "anonymous"

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, resolution, resolution)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }

    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }

    img.src = url
  })
}
