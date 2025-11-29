"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QRMatrix } from "@/lib/qr-generator"
import { type QRStyleConfig, renderQRCodeToSVG, renderQRCodeToCanvasSync } from "@/lib/qr-renderer"

interface QRPreviewProps {
  qrMatrix: QRMatrix
  styleConfig: QRStyleConfig
}

const resolutionOptions = [
  { value: "512", label: "512 x 512" },
  { value: "1024", label: "1024 x 1024" },
  { value: "2048", label: "2048 x 2048" },
  { value: "4096", label: "4096 x 4096" },
]

export function QRPreview({ qrMatrix, styleConfig }: QRPreviewProps) {
  const [resolution, setResolution] = useState("1024")
  const [downloading, setDownloading] = useState<"png" | "svg" | null>(null)
  const [downloaded, setDownloaded] = useState<"png" | "svg" | null>(null)

  // Generate SVG for preview
  const svgContent = useMemo(() => {
    return renderQRCodeToSVG(qrMatrix, styleConfig)
  }, [qrMatrix, styleConfig])

  const handleDownloadPNG = useCallback(async () => {
    if (!qrMatrix.modules.length) return

    setDownloading("png")

    try {
      const canvas = await renderQRCodeToCanvasSync(qrMatrix, styleConfig, Number.parseInt(resolution))
      const dataUrl = canvas.toDataURL("image/png")

      const link = document.createElement("a")
      link.download = `qr-code-${resolution}px.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloaded("png")
      setTimeout(() => setDownloaded(null), 2000)
    } catch (error) {
      console.error("Failed to download PNG:", error)
    } finally {
      setDownloading(null)
    }
  }, [qrMatrix, styleConfig, resolution])

  const handleDownloadSVG = useCallback(() => {
    if (!svgContent) return

    setDownloading("svg")

    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.download = "qr-code.svg"
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      setDownloaded("svg")
      setTimeout(() => setDownloaded(null), 2000)
    } catch (error) {
      console.error("Failed to download SVG:", error)
    } finally {
      setDownloading(null)
    }
  }, [svgContent])

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Preview</span>
          {qrMatrix.version > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Version {qrMatrix.version} ({qrMatrix.size}x{qrMatrix.size})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Preview */}
        <div className="relative aspect-square rounded-xl border border-border overflow-hidden bg-white flex items-center justify-center">
          {svgContent ? (
            <div className="w-full h-full p-2" dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            <div className="text-muted-foreground text-sm">Enter content to generate QR code</div>
          )}
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                {resolutionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleDownloadPNG} disabled={!svgContent || downloading === "png"} className="gap-2">
              {downloading === "png" ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : downloaded === "png" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              PNG
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadSVG}
              disabled={!svgContent || downloading === "svg"}
              className="gap-2 bg-transparent"
            >
              {downloading === "svg" ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : downloaded === "svg" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              )}
              SVG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
