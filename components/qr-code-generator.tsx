"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { QRPreview } from "./qr-preview"
import { ControlPanel } from "./control-panel"
import { Header } from "./header"
import { generateQRCode, type ErrorCorrectionLevel } from "@/lib/qr-generator"
import { type QRStyleConfig, defaultStyleConfig } from "@/lib/qr-renderer"
import { type QRContent, type QRContentType, formatQRContent, getDefaultContent } from "@/lib/qr-content-types"

export function QRCodeGenerator() {
  const [isDark, setIsDark] = useState(false)
  const [content, setContent] = useState<QRContent>({ type: "url", data: { url: "https://example.com" } })
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M")
  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>(defaultStyleConfig)

  // Format content to string
  const qrData = useMemo(() => formatQRContent(content), [content])

  // Generate QR matrix
  const qrMatrix = useMemo(() => generateQRCode(qrData, errorLevel), [qrData, errorLevel])

  // Toggle dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const handleContentTypeChange = useCallback((type: QRContentType) => {
    setContent(getDefaultContent(type))
  }, [])

  const updateStyleConfig = useCallback((updates: Partial<QRStyleConfig>) => {
    setStyleConfig((prev) => ({ ...prev, ...updates }))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Control Panel - Left Side */}
          <div className="lg:w-[480px] xl:w-[520px] flex-shrink-0">
            <ControlPanel
              content={content}
              onContentChange={setContent}
              onContentTypeChange={handleContentTypeChange}
              errorLevel={errorLevel}
              onErrorLevelChange={setErrorLevel}
              styleConfig={styleConfig}
              onStyleConfigChange={updateStyleConfig}
            />
          </div>

          {/* Preview - Right Side */}
          <div className="flex-1 min-w-0">
            <QRPreview qrMatrix={qrMatrix} styleConfig={styleConfig} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>QR Studio - Generate custom QR codes with advanced styling options</p>
        </div>
      </footer>
    </div>
  )
}
