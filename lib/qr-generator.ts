import QRCode from "qrcode-generator"

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"

export interface QRMatrix {
  modules: boolean[][]
  size: number
  version: number
}

export function generateQRCode(data: string, ecLevel: ErrorCorrectionLevel = "M"): QRMatrix {
  if (!data) {
    return { modules: [], size: 0, version: 1 }
  }

  const qr = QRCode(0, ecLevel)
  qr.addData(data)
  qr.make()

  const size = qr.getModuleCount()
  const modules = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => qr.isDark(row, col)),
  )

  return {
    modules,
    size,
    version: qr.getVersion(),
  }
}
