"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { ErrorCorrectionLevel } from "@/lib/qr-generator"
import type { QRStyleConfig } from "@/lib/qr-renderer"
import type { QRContent, QRContentType } from "@/lib/qr-content-types"
import { ShapeSelector } from "./shape-selector"
import { ColorPicker } from "./color-picker"
import { GradientEditor } from "./gradient-editor"
import { ContentTypeSelector } from "./content-type-selector"
import { ContentForm } from "./content-form"
import {
  bodyShapes,
  eyeFrameShapes,
  eyeBallShapes,
  type BodyShape,
  type EyeFrameShape,
  type EyeBallShape,
} from "@/lib/qr-shapes"

// Simple inline SVG icons
const FileTextIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)

const ShapesIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <circle cx="17.5" cy="17.5" r="3.5" />
  </svg>
)

const PaletteIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
)

const SettingsIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

interface ControlPanelProps {
  content: QRContent
  onContentChange: (content: QRContent) => void
  onContentTypeChange: (type: QRContentType) => void
  errorLevel: ErrorCorrectionLevel
  onErrorLevelChange: (level: ErrorCorrectionLevel) => void
  styleConfig: QRStyleConfig
  onStyleConfigChange: (updates: Partial<QRStyleConfig>) => void
}

export function ControlPanel({
  content,
  onContentChange,
  onContentTypeChange,
  errorLevel,
  onErrorLevelChange,
  styleConfig,
  onStyleConfigChange,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState("content")

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="gap-1.5">
            <FileTextIcon />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="shapes" className="gap-1.5">
            <ShapesIcon />
            <span className="hidden sm:inline">Shapes</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5">
            <PaletteIcon />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <SettingsIcon />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentTypeSelector selectedType={content.type} onSelect={onContentTypeChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Content Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentForm content={content} onChange={onContentChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Error Correction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={errorLevel} onValueChange={(v) => onErrorLevelChange(v as ErrorCorrectionLevel)}>
                  <SelectTrigger id="error-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher error correction allows the QR code to be read even if partially damaged
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shapes Tab */}
        <TabsContent value="shapes" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Body Shape</CardTitle>
            </CardHeader>
            <CardContent>
              <ShapeSelector
                shapes={bodyShapes}
                selectedShape={styleConfig.bodyShape}
                onSelect={(shape) => onStyleConfigChange({ bodyShape: shape as BodyShape })}
                type="body"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eye Frame Shape</CardTitle>
            </CardHeader>
            <CardContent>
              <ShapeSelector
                shapes={eyeFrameShapes}
                selectedShape={styleConfig.eyeFrameShape}
                onSelect={(shape) => onStyleConfigChange({ eyeFrameShape: shape as EyeFrameShape })}
                type="eyeFrame"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eye Ball Shape</CardTitle>
            </CardHeader>
            <CardContent>
              <ShapeSelector
                shapes={eyeBallShapes}
                selectedShape={styleConfig.eyeBallShape}
                onSelect={(shape) => onStyleConfigChange({ eyeBallShape: shape as EyeBallShape })}
                type="eyeBall"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Body Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                color={styleConfig.bodyColor}
                onChange={(color) => onStyleConfigChange({ bodyColor: color })}
                label="Solid Color"
              />
              <GradientEditor
                gradient={styleConfig.bodyGradient}
                onChange={(gradient) => onStyleConfigChange({ bodyGradient: gradient })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eye Frame Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                color={styleConfig.eyeFrameColor}
                onChange={(color) => onStyleConfigChange({ eyeFrameColor: color })}
                label="Solid Color"
              />
              <GradientEditor
                gradient={styleConfig.eyeFrameGradient}
                onChange={(gradient) => onStyleConfigChange({ eyeFrameGradient: gradient })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eye Ball Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                color={styleConfig.eyeBallColor}
                onChange={(color) => onStyleConfigChange({ eyeBallColor: color })}
                label="Solid Color"
              />
              <GradientEditor
                gradient={styleConfig.eyeBallGradient}
                onChange={(gradient) => onStyleConfigChange({ eyeBallGradient: gradient })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="transparent-bg">Transparent Background</Label>
                <Switch
                  id="transparent-bg"
                  checked={styleConfig.backgroundTransparent}
                  onCheckedChange={(checked) => onStyleConfigChange({ backgroundTransparent: checked })}
                />
              </div>
              {!styleConfig.backgroundTransparent && (
                <ColorPicker
                  color={styleConfig.backgroundColor}
                  onChange={(color) => onStyleConfigChange({ backgroundColor: color })}
                  label="Background Color"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Module Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Size</span>
                  <span className="text-muted-foreground">{styleConfig.moduleSize}px</span>
                </div>
                <Slider
                  value={[styleConfig.moduleSize]}
                  onValueChange={([value]) => onStyleConfigChange({ moduleSize: value })}
                  min={5}
                  max={20}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Padding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Padding</span>
                  <span className="text-muted-foreground">{styleConfig.padding} modules</span>
                </div>
                <Slider
                  value={[styleConfig.padding]}
                  onValueChange={([value]) => onStyleConfigChange({ padding: value })}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
