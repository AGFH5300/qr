// QR Code generation utilities
// Based on QR Code specification ISO/IEC 18004

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"

const ERROR_CORRECTION_CODEWORDS: Record<ErrorCorrectionLevel, number[]> = {
  L: [
    7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  M: [
    10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ],
  Q: [
    13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  H: [
    17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
}

const MODE_INDICATOR = {
  numeric: 0b0001,
  alphanumeric: 0b0010,
  byte: 0b0100,
  kanji: 0b1000,
}

const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

// Generator polynomial for error correction
const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)

// Initialize Galois Field tables
;(function initGF() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255]
  }
})()

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function gfPolyMultiply(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0)
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMultiply(p1[i], p2[j])
    }
  }
  return result
}

function gfPolyDivide(dividend: number[], divisor: number[]): number[] {
  const result = [...dividend]
  for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
    const coef = result[i]
    if (coef !== 0) {
      for (let j = 1; j < divisor.length; j++) {
        if (divisor[j] !== 0) {
          result[i + j] ^= gfMultiply(divisor[j], coef)
        }
      }
    }
  }
  return result.slice(dividend.length - divisor.length + 1)
}

function getGeneratorPoly(degree: number): number[] {
  let g = [1]
  for (let i = 0; i < degree; i++) {
    g = gfPolyMultiply(g, [1, GF_EXP[i]])
  }
  return g
}

function getErrorCorrection(data: number[], ecCodewords: number): number[] {
  const generator = getGeneratorPoly(ecCodewords)
  const padded = [...data, ...new Array(ecCodewords).fill(0)]
  return gfPolyDivide(padded, generator)
}

function getMode(data: string): "numeric" | "alphanumeric" | "byte" {
  if (/^\d+$/.test(data)) return "numeric"
  if ([...data].every((c) => ALPHANUMERIC_CHARS.includes(c.toUpperCase()))) return "alphanumeric"
  return "byte"
}

function getVersion(data: string, ecLevel: ErrorCorrectionLevel): number {
  const mode = getMode(data)
  const dataLength = new TextEncoder().encode(data).length

  // Simplified capacity table (byte mode)
  const capacities: Record<ErrorCorrectionLevel, number[]> = {
    L: [
      17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003, 1091,
      1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953,
    ],
    M: [
      14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911,
      997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331,
    ],
    Q: [
      11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565, 611, 661,
      715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663,
    ],
    H: [
      7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535,
      593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273,
    ],
  }

  for (let v = 0; v < 40; v++) {
    if (capacities[ecLevel][v] >= dataLength) return v + 1
  }
  return 40
}

function encodeData(data: string, version: number): number[] {
  const mode = getMode(data)
  const bits: number[] = []

  // Mode indicator
  const modeIndicator = MODE_INDICATOR[mode]
  for (let i = 3; i >= 0; i--) bits.push((modeIndicator >> i) & 1)

  // Character count indicator
  const countBits =
    version < 10
      ? mode === "numeric"
        ? 10
        : mode === "alphanumeric"
          ? 9
          : 8
      : version < 27
        ? mode === "numeric"
          ? 12
          : mode === "alphanumeric"
            ? 11
            : 16
        : mode === "numeric"
          ? 14
          : mode === "alphanumeric"
            ? 13
            : 16

  const bytes = new TextEncoder().encode(data)
  const count = mode === "byte" ? bytes.length : data.length

  for (let i = countBits - 1; i >= 0; i--) bits.push((count >> i) & 1)

  // Data encoding
  if (mode === "byte") {
    for (const byte of bytes) {
      for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1)
    }
  } else if (mode === "numeric") {
    for (let i = 0; i < data.length; i += 3) {
      const group = data.slice(i, i + 3)
      const value = Number.parseInt(group, 10)
      const numBits = group.length === 3 ? 10 : group.length === 2 ? 7 : 4
      for (let j = numBits - 1; j >= 0; j--) bits.push((value >> j) & 1)
    }
  } else {
    const upperData = data.toUpperCase()
    for (let i = 0; i < upperData.length; i += 2) {
      if (i + 1 < upperData.length) {
        const value = ALPHANUMERIC_CHARS.indexOf(upperData[i]) * 45 + ALPHANUMERIC_CHARS.indexOf(upperData[i + 1])
        for (let j = 10; j >= 0; j--) bits.push((value >> j) & 1)
      } else {
        const value = ALPHANUMERIC_CHARS.indexOf(upperData[i])
        for (let j = 5; j >= 0; j--) bits.push((value >> j) & 1)
      }
    }
  }

  return bits
}

function addTerminator(bits: number[], capacity: number): number[] {
  const result = [...bits]
  // Add terminator
  const terminator = Math.min(4, capacity * 8 - result.length)
  for (let i = 0; i < terminator; i++) result.push(0)
  // Pad to byte boundary
  while (result.length % 8 !== 0) result.push(0)
  // Add pad bytes
  const padBytes = [0b11101100, 0b00010001]
  let padIndex = 0
  while (result.length < capacity * 8) {
    const byte = padBytes[padIndex % 2]
    for (let i = 7; i >= 0; i--) result.push((byte >> i) & 1)
    padIndex++
  }
  return result
}

function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0)
    bytes.push(byte)
  }
  return bytes
}

export interface QRMatrix {
  modules: (boolean | null)[][]
  size: number
  version: number
}

function createMatrix(version: number): (boolean | null)[][] {
  const size = version * 4 + 17
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(null))
}

function addFinderPattern(matrix: (boolean | null)[][], row: number, col: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const tr = row + r
      const tc = col + c
      if (tr >= 0 && tr < matrix.length && tc >= 0 && tc < matrix.length) {
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          matrix[tr][tc] = false
        } else if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6) {
            matrix[tr][tc] = true
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            matrix[tr][tc] = true
          } else {
            matrix[tr][tc] = false
          }
        }
      }
    }
  }
}

function addAlignmentPattern(matrix: (boolean | null)[][], row: number, col: number): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const tr = row + r
      const tc = col + c
      if (matrix[tr][tc] === null) {
        if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
          matrix[tr][tc] = true
        } else {
          matrix[tr][tc] = false
        }
      }
    }
  }
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) return []
  const positions = [6]
  const size = version * 4 + 17
  const last = size - 7
  const step = Math.ceil((last - 6) / Math.floor(version / 7 + 1))
  const adjusted = step + ((last - 6) % step === 0 ? 0 : step - ((last - 6) % step)) / Math.floor(version / 7 + 1)
  for (let pos = last; pos > 6; pos -= Math.round(adjusted)) {
    positions.unshift(pos)
  }
  if (positions[0] !== 6) positions.unshift(6)
  return [...new Set(positions)].sort((a, b) => a - b)
}

function addTimingPatterns(matrix: (boolean | null)[][]): void {
  const size = matrix.length
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }
}

function addFormatInfo(matrix: (boolean | null)[][], ecLevel: ErrorCorrectionLevel, mask: number): void {
  const formatBits = getFormatBits(ecLevel, mask)
  const size = matrix.length

  // Around top-left finder pattern
  for (let i = 0; i <= 5; i++) matrix[8][i] = formatBits[i]
  matrix[8][7] = formatBits[6]
  matrix[8][8] = formatBits[7]
  matrix[7][8] = formatBits[8]
  for (let i = 9; i <= 14; i++) matrix[14 - i][8] = formatBits[i]

  // Around other finder patterns
  for (let i = 0; i <= 7; i++) matrix[size - 1 - i][8] = formatBits[i]
  for (let i = 8; i <= 14; i++) matrix[8][size - 15 + i] = formatBits[i]

  // Dark module
  matrix[size - 8][8] = true
}

function getFormatBits(ecLevel: ErrorCorrectionLevel, mask: number): boolean[] {
  const ecBits: Record<ErrorCorrectionLevel, number> = { L: 1, M: 0, Q: 3, H: 2 }
  const data = (ecBits[ecLevel] << 3) | mask
  let poly = data << 10

  // BCH(15,5) error correction
  const generator = 0b10100110111
  for (let i = 4; i >= 0; i--) {
    if (poly & (1 << (i + 10))) {
      poly ^= generator << i
    }
  }
  const format = ((data << 10) | poly) ^ 0b101010000010010

  return Array(15)
    .fill(0)
    .map((_, i) => ((format >> (14 - i)) & 1) === 1)
}

function addVersionInfo(matrix: (boolean | null)[][], version: number): void {
  if (version < 7) return

  const versionBits = getVersionBits(version)
  const size = matrix.length

  for (let i = 0; i < 18; i++) {
    const bit = versionBits[i]
    const row = Math.floor(i / 3)
    const col = size - 11 + (i % 3)
    matrix[row][col] = bit
    matrix[col][row] = bit
  }
}

function getVersionBits(version: number): boolean[] {
  let poly = version << 12
  const generator = 0b1111100100101

  for (let i = 5; i >= 0; i--) {
    if (poly & (1 << (i + 12))) {
      poly ^= generator << i
    }
  }

  const result = (version << 12) | poly
  return Array(18)
    .fill(0)
    .map((_, i) => ((result >> (17 - i)) & 1) === 1)
}

function applyMask(matrix: (boolean | null)[][], mask: number, reserved: boolean[][]): void {
  const size = matrix.length

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue

      let shouldFlip = false
      switch (mask) {
        case 0:
          shouldFlip = (r + c) % 2 === 0
          break
        case 1:
          shouldFlip = r % 2 === 0
          break
        case 2:
          shouldFlip = c % 3 === 0
          break
        case 3:
          shouldFlip = (r + c) % 3 === 0
          break
        case 4:
          shouldFlip = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0
          break
        case 5:
          shouldFlip = ((r * c) % 2) + ((r * c) % 3) === 0
          break
        case 6:
          shouldFlip = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0
          break
        case 7:
          shouldFlip = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
          break
      }

      if (shouldFlip && matrix[r][c] !== null) {
        matrix[r][c] = !matrix[r][c]
      }
    }
  }
}

function placeData(matrix: (boolean | null)[][], data: number[], reserved: boolean[][]): void {
  const size = matrix.length
  let dataIndex = 0
  let upward = true

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5

    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i

      for (let c = 0; c < 2; c++) {
        const currentCol = col - c
        if (!reserved[row][currentCol] && matrix[row][currentCol] === null) {
          matrix[row][currentCol] = dataIndex < data.length ? data[dataIndex] === 1 : false
          dataIndex++
        }
      }
    }
    upward = !upward
  }
}

function calculatePenalty(matrix: (boolean | null)[][]): number {
  const size = matrix.length
  let penalty = 0

  // Rule 1: Groups of 5+ same-color modules
  for (let r = 0; r < size; r++) {
    let count = 1
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++
        if (count === 5) penalty += 3
        else if (count > 5) penalty++
      } else {
        count = 1
      }
    }
  }

  for (let c = 0; c < size; c++) {
    let count = 1
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++
        if (count === 5) penalty += 3
        else if (count > 5) penalty++
      } else {
        count = 1
      }
    }
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const color = matrix[r][c]
      if (color === matrix[r][c + 1] && color === matrix[r + 1][c] && color === matrix[r + 1][c + 1]) {
        penalty += 3
      }
    }
  }

  // Rule 3: Finder pattern-like sequences
  const pattern1 = [true, false, true, true, true, false, true, false, false, false, false]
  const pattern2 = [false, false, false, false, true, false, true, true, true, false, true]

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 10; c++) {
      let match1 = true,
        match2 = true
      for (let i = 0; i < 11; i++) {
        if (matrix[r][c + i] !== pattern1[i]) match1 = false
        if (matrix[r][c + i] !== pattern2[i]) match2 = false
      }
      if (match1 || match2) penalty += 40
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 10; r++) {
      let match1 = true,
        match2 = true
      for (let i = 0; i < 11; i++) {
        if (matrix[r + i][c] !== pattern1[i]) match1 = false
        if (matrix[r + i][c] !== pattern2[i]) match2 = false
      }
      if (match1 || match2) penalty += 40
    }
  }

  // Rule 4: Balance of dark/light modules
  let dark = 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) dark++
    }
  }
  const percent = (dark * 100) / (size * size)
  const k = Math.abs(Math.floor(percent / 5) - 10)
  penalty += k * 10

  return penalty
}

export function generateQRCode(data: string, ecLevel: ErrorCorrectionLevel = "M"): QRMatrix {
  if (!data) {
    return { modules: [], size: 0, version: 1 }
  }

  const version = getVersion(data, ecLevel)
  const size = version * 4 + 17

  // Get data capacity
  const totalCodewords = getDataCodewords(version, ecLevel)

  // Encode data
  let bits = encodeData(data, version)
  bits = addTerminator(bits, totalCodewords.data)
  const dataBytes = bitsToBytes(bits)

  // Add error correction
  const ecBytes = getErrorCorrection(dataBytes, totalCodewords.ec)
  const allBytes = [...dataBytes, ...ecBytes]
  const allBits = allBytes.flatMap((b) =>
    Array(8)
      .fill(0)
      .map((_, i) => (b >> (7 - i)) & 1),
  )

  // Create and populate matrix
  const matrix = createMatrix(version)
  const reserved = createMatrix(version).map((row) => row.map(() => false))

  // Add finder patterns
  addFinderPattern(matrix, 0, 0)
  addFinderPattern(matrix, 0, size - 7)
  addFinderPattern(matrix, size - 7, 0)

  // Mark finder patterns as reserved
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (r < size && c < size) reserved[r][c] = true
      if (r < size && size - 8 + c < size && size - 8 + c >= 0) reserved[r][size - 8 + c] = true
      if (size - 8 + r < size && size - 8 + r >= 0 && c < size) reserved[size - 8 + r][c] = true
    }
  }

  // Add alignment patterns
  const alignPositions = getAlignmentPatternPositions(version)
  for (const r of alignPositions) {
    for (const c of alignPositions) {
      if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue
      addAlignmentPattern(matrix, r, c)
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (r + dr >= 0 && r + dr < size && c + dc >= 0 && c + dc < size) {
            reserved[r + dr][c + dc] = true
          }
        }
      }
    }
  }

  // Add timing patterns
  addTimingPatterns(matrix)
  for (let i = 0; i < size; i++) {
    reserved[6][i] = true
    reserved[i][6] = true
  }

  // Reserve format info area
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = true
    reserved[i][8] = true
    if (size - 8 + i < size) reserved[8][size - 8 + i] = true
    if (size - 8 + i < size) reserved[size - 8 + i][8] = true
  }

  // Add version info for version >= 7
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][size - 11 + j] = true
        reserved[size - 11 + j][i] = true
      }
    }
  }

  // Place data
  placeData(matrix, allBits, reserved)

  // Find best mask
  let bestMask = 0
  let bestPenalty = Number.POSITIVE_INFINITY

  for (let mask = 0; mask < 8; mask++) {
    const testMatrix = matrix.map((row) => [...row])
    applyMask(testMatrix, mask, reserved)
    addFormatInfo(testMatrix, ecLevel, mask)
    if (version >= 7) addVersionInfo(testMatrix, version)

    const penalty = calculatePenalty(testMatrix)
    if (penalty < bestPenalty) {
      bestPenalty = penalty
      bestMask = mask
    }
  }

  // Apply best mask
  applyMask(matrix, bestMask, reserved)
  addFormatInfo(matrix, ecLevel, bestMask)
  if (version >= 7) addVersionInfo(matrix, version)

  return {
    modules: matrix.map((row) => row.map((cell) => cell === true)),
    size,
    version,
  }
}

function getDataCodewords(version: number, ecLevel: ErrorCorrectionLevel): { data: number; ec: number } {
  const totalCodewords =
    Math.floor((version * 4 + 17) ** 2 / 8) -
    (version < 2 ? 0 : Math.floor((version / 7 + 2) ** 2 - 3) * 5) -
    31 -
    (version < 7 ? 0 : 36)
  const ecCodewords =
    ERROR_CORRECTION_CODEWORDS[ecLevel][version - 1] *
    (version < 2 ? 1 : version < 7 ? (ecLevel === "L" ? 1 : ecLevel === "M" ? 1 : 2) : 2)

  // Simplified calculation
  const capacities: Record<ErrorCorrectionLevel, number[]> = {
    L: [
      19, 34, 55, 80, 108, 136, 156, 194, 232, 274, 324, 370, 428, 461, 523, 589, 647, 721, 795, 861, 932, 1006, 1094,
      1174, 1276, 1370, 1468, 1531, 1631, 1735, 1843, 1955, 2071, 2191, 2306, 2434, 2566, 2702, 2812, 2956,
    ],
    M: [
      16, 28, 44, 64, 86, 108, 124, 154, 182, 216, 254, 290, 334, 365, 415, 453, 507, 563, 627, 669, 714, 782, 860, 914,
      1000, 1062, 1128, 1193, 1267, 1373, 1455, 1541, 1631, 1725, 1812, 1914, 1992, 2102, 2216, 2334,
    ],
    Q: [
      13, 22, 34, 48, 62, 76, 88, 110, 132, 154, 180, 206, 244, 261, 295, 325, 367, 397, 445, 485, 512, 568, 614, 664,
      718, 754, 808, 871, 911, 985, 1033, 1115, 1171, 1231, 1286, 1354, 1426, 1502, 1582, 1666,
    ],
    H: [
      9, 16, 26, 36, 46, 60, 66, 86, 100, 122, 140, 158, 180, 197, 223, 253, 283, 313, 341, 385, 406, 442, 464, 514,
      538, 596, 628, 661, 701, 745, 793, 845, 901, 961, 986, 1054, 1096, 1142, 1222, 1276,
    ],
  }

  return {
    data: capacities[ecLevel][version - 1] || 100,
    ec: ecCodewords,
  }
}
