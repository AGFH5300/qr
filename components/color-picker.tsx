"use client"

import { useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

const presetColors = [
  "#000000",
  "#1a1a1a",
  "#333333",
  "#4a4a4a",
  "#666666",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ffffff",
  "#f5f5f5",
  "#e5e5e5",
]

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color)

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        onChange(value)
      }
    },
    [onChange],
  )

  const handleColorSelect = useCallback(
    (newColor: string) => {
      setInputValue(newColor)
      onChange(newColor)
    },
    [onChange],
  )

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm text-muted-foreground">{label}</Label>}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: color }}
              aria-label="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="grid grid-cols-5 gap-1.5">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorSelect(presetColor)}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-full h-8 cursor-pointer rounded"
              />
            </div>
          </PopoverContent>
        </Popover>

        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
          maxLength={7}
        />
      </div>
    </div>
  )
}
