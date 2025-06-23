"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
    label: string
    value: string
    onChange: (color: string) => void
    disabled?: boolean
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    label,
    value,
    onChange,
    disabled = false
}) => {
    return (
        <div>
            <Label className="text-sm font-medium">{label}</Label>
            <div className="mt-1 flex items-center gap-2">
                <Input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-8 p-0 border rounded cursor-pointer"
                    disabled={disabled}
                />
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#000000"
                    disabled={disabled}
                />
            </div>
        </div>
    )
}
