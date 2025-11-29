"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GradientConfig } from "@/lib/qr-renderer"
import { ColorPicker } from "./color-picker"

interface GradientEditorProps {
  gradient: GradientConfig
  onChange: (gradient: GradientConfig) => void
}

export function GradientEditor({ gradient, onChange }: GradientEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-gradient" className="text-sm">
          Enable Gradient
        </Label>
        <Switch
          id="enable-gradient"
          checked={gradient.enabled}
          onCheckedChange={(enabled) => onChange({ ...gradient, enabled })}
        />
      </div>

      {gradient.enabled && (
        <>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Gradient Type</Label>
            <Select
              value={gradient.type}
              onValueChange={(type: "linear" | "radial") => onChange({ ...gradient, type })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gradient.type === "linear" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Direction</Label>
                <span className="text-muted-foreground">{gradient.direction}°</span>
              </div>
              <Slider
                value={[gradient.direction]}
                onValueChange={([direction]) => onChange({ ...gradient, direction })}
                min={0}
                max={360}
                step={15}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <ColorPicker
                color={gradient.colors[0]}
                onChange={(color) => onChange({ ...gradient, colors: [color, gradient.colors[1]] })}
                label="Start Color"
              />
            </div>
            <div>
              <ColorPicker
                color={gradient.colors[1]}
                onChange={(color) => onChange({ ...gradient, colors: [gradient.colors[0], color] })}
                label="End Color"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="h-8 rounded-lg border border-border overflow-hidden">
            <div
              className="w-full h-full"
              style={{
                background:
                  gradient.type === "linear"
                    ? `linear-gradient(${gradient.direction}deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
                    : `radial-gradient(circle, ${gradient.colors[0]}, ${gradient.colors[1]})`,
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
