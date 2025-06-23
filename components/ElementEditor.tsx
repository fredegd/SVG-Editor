"use client"

import React from "react"
import { Palette } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "./ColorPicker"
import { GradientEditor, GradientConfig } from "./GradientEditor"
import type { SelectedElement } from "../hooks/useSVGEditor"

interface ElementEditorProps {
    selectedElement: SelectedElement | null
    selectedElementSelector: string
    fillColor: string
    strokeColor: string
    strokeWidth: number
    isGradientMode: { fill: boolean; stroke: boolean }
    gradientConfig: { fill: GradientConfig; stroke: GradientConfig }
    onFillColorChange: (color: string) => void
    onStrokeColorChange: (color: string) => void
    onStrokeWidthChange: (width: number) => void
    onGradientModeChange: (type: 'fill' | 'stroke', enabled: boolean) => void
    onGradientConfigChange: (type: 'fill' | 'stroke', config: GradientConfig) => void
    onDeselect: () => void
    onRefresh: () => void
    findElementBySelector: (selector: string) => SVGElement | null
    isGroupElement: (element: SVGElement) => boolean
    getStyleableChildren: (element: SVGElement) => SVGElement[]
}

export const ElementEditor: React.FC<ElementEditorProps> = ({
    selectedElement,
    selectedElementSelector,
    fillColor,
    strokeColor,
    strokeWidth,
    isGradientMode,
    gradientConfig,
    onFillColorChange,
    onStrokeColorChange,
    onStrokeWidthChange,
    onGradientModeChange,
    onGradientConfigChange,
    onDeselect,
    onRefresh,
    findElementBySelector,
    isGroupElement,
    getStyleableChildren
}) => {
    const handleFillGradientConfigChange = (config: GradientConfig) => {
        onGradientConfigChange('fill', config)
    }

    const handleStrokeGradientConfigChange = (config: GradientConfig) => {
        onGradientConfigChange('stroke', config)
    }

    return (
        <Card className=" bg-neutral-100/80 dark:bg-neutral-800/30">
            <CardContent className="space-y-4">
                {selectedElement ? (
                    <>
                        <div>
                            <Label className="text-sm font-medium">Selected Element</Label>
                            <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant="secondary">{selectedElement.tagName}</Badge>
                                {selectedElement.id && <Badge variant="outline">#{selectedElement.id}</Badge>}
                                {selectedElement.className && (
                                    <Badge variant="outline">.{selectedElement.className.split(" ")[0]}</Badge>
                                )}
                            </div>

                            {/* Show group info if applicable */}
                            {(() => {
                                const element = findElementBySelector(selectedElementSelector)
                                if (element && isGroupElement(element)) {
                                    const childCount = getStyleableChildren(element).length
                                    return (
                                        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="bg-blue-500">Group</Badge>
                                                <span className="text-xs text-blue-700">
                                                    Contains {childCount} styleable element{childCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Style changes will apply to all child elements
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            })()}
                        </div>

                        <div className="space-y-4">
                            {/* Fill Color Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium">Fill Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs">Gradient</Label>
                                        <input
                                            type="checkbox"
                                            checked={isGradientMode.fill}
                                            onChange={(e) => onGradientModeChange('fill', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                </div>

                                {!isGradientMode.fill ? (
                                    <ColorPicker
                                        label=""
                                        value={fillColor}
                                        onChange={onFillColorChange}
                                    />
                                ) : (
                                    <GradientEditor
                                        config={gradientConfig.fill}
                                        onChange={handleFillGradientConfigChange}
                                    />
                                )}
                            </div>

                            {/* Stroke Color Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium">Stroke Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs">Gradient</Label>
                                        <input
                                            type="checkbox"
                                            checked={isGradientMode.stroke}
                                            onChange={(e) => onGradientModeChange('stroke', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                </div>

                                {!isGradientMode.stroke ? (
                                    <ColorPicker
                                        label=""
                                        value={strokeColor}
                                        onChange={onStrokeColorChange}
                                    />
                                ) : (
                                    <GradientEditor
                                        config={gradientConfig.stroke}
                                        onChange={handleStrokeGradientConfigChange}
                                    />
                                )}
                            </div>

                            {/* Stroke Width Section */}
                            <div>
                                <Label className="text-sm font-medium">Stroke Width</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input
                                        type="range"
                                        min="0"
                                        max="20"
                                        step="0.5"
                                        value={strokeWidth}
                                        onChange={(e) => onStrokeWidthChange(parseFloat(e.target.value))}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        min="0"
                                        max="50"
                                        step="0.1"
                                        value={strokeWidth}
                                        onChange={(e) => onStrokeWidthChange(parseFloat(e.target.value) || 0)}
                                        className="w-16 text-xs"
                                    />
                                    <span className="text-xs">px</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                onClick={onDeselect}
                                variant="outline"
                                className="flex-1"
                                size="sm"
                            >
                                Deselect
                            </Button>

                            <Button
                                onClick={onRefresh}
                                variant="outline"
                                className="flex-1"
                                size="sm"
                            >
                                Refresh
                            </Button>
                        </div>

                        {/* Debug info - compact */}
                        {selectedElement && (
                            <div className="mt-4 p-2 bg-gray-50 rounded text-xs space-y-1">
                                <div><strong>Debug:</strong></div>
                                <div>Tag: {selectedElement.tagName} | ID: {selectedElement.elementId}</div>
                                <div>Fill: {fillColor} | Stroke: {strokeColor}</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Click on an SVG element or select from the tree to edit colors</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
