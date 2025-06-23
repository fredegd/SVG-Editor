"use client"

import React, { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface GradientConfig {
    type: 'linear' | 'radial'
    startColor: string
    endColor: string
    angle: number
}

interface GradientEditorProps {
    config: GradientConfig
    onChange: (config: GradientConfig) => void
    disabled?: boolean
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
    config,
    onChange,
    disabled = false
}) => {
    const updateConfig = useCallback((updates: Partial<GradientConfig>) => {
        const newConfig = { ...config, ...updates }
        onChange(newConfig)
    }, [config, onChange])

    // Handle color changes with immediate feedback
    const handleStartColorChange = useCallback((color: string) => {
        updateConfig({ startColor: color })
    }, [updateConfig])

    const handleEndColorChange = useCallback((color: string) => {
        updateConfig({ endColor: color })
    }, [updateConfig])

    const handleTypeChange = useCallback((type: 'linear' | 'radial') => {
        updateConfig({ type })
    }, [updateConfig])

    const handleAngleChange = useCallback((angle: number) => {
        updateConfig({ angle })
    }, [updateConfig])

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label className="text-xs">Type:</Label>
                <select
                    value={config.type}
                    onChange={(e) => handleTypeChange(e.target.value as 'linear' | 'radial')}
                    className="text-xs px-2 py-1 border rounded"
                    disabled={disabled}
                >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <Label className="text-xs">Start:</Label>
                <Input
                    type="color"
                    value={config.startColor}
                    onChange={(e) => handleStartColorChange(e.target.value)}
                    className="w-8 h-6 p-0 border rounded cursor-pointer"
                    disabled={disabled}
                />
                <Input
                    type="text"
                    value={config.startColor}
                    onChange={(e) => handleStartColorChange(e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#000000"
                    disabled={disabled}
                />
            </div>

            <div className="flex items-center gap-2">
                <Label className="text-xs">End:</Label>
                <Input
                    type="color"
                    value={config.endColor}
                    onChange={(e) => handleEndColorChange(e.target.value)}
                    className="w-8 h-6 p-0 border rounded cursor-pointer"
                    disabled={disabled}
                />
                <Input
                    type="text"
                    value={config.endColor}
                    onChange={(e) => handleEndColorChange(e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#ffffff"
                    disabled={disabled}
                />
            </div>

            {config.type === 'linear' && (
                <div className="flex items-center gap-2">
                    <Label className="text-xs">Angle:</Label>
                    <Input
                        type="range"
                        min="0"
                        max="360"
                        value={config.angle}
                        onChange={(e) => handleAngleChange(parseInt(e.target.value))}
                        className="flex-1"
                        disabled={disabled}
                    />
                    <span className="text-xs w-8">{config.angle}°</span>
                </div>
            )}
        </div>
    )
}
