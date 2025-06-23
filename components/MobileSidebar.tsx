"use client"

import React from "react"
import { ElementStructureTree } from "@/components/ElementStructureTree"
import { ElementEditor } from "@/components/ElementEditor"
import type { TreeNode } from "@/components/TreeNode"
import type { GradientConfig } from "@/components/GradientEditor"
import type { SelectedElement } from "@/hooks/useSVGEditor"

interface MobileSidebarProps {
    isOpen: boolean
    onClose: () => void
    treeStructure: TreeNode[]
    selectedElement: SelectedElement | null
    selectedElementSelector: string
    onElementSelect: (elementId: string, uniqueSelector: string) => void
    onTreeNodeToggle: (node: TreeNode) => void
    findElementBySelector: (selector: string) => SVGElement | null
    isGroupElement: (element: SVGElement) => boolean
    getStyleableChildren: (element: SVGElement) => SVGElement[]
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
    // Visibility functions
    getElementVisibilityStatus: (selector: string) => boolean
    toggleElementVisibility: (selector: string) => void
    toggleGroupVisibility: (selector: string) => void
    // Count elements function
    countElements: (nodes: TreeNode[]) => number
}

export function MobileSidebar({
    isOpen,
    onClose,
    treeStructure,
    selectedElement,
    selectedElementSelector,
    onElementSelect,
    onTreeNodeToggle,
    findElementBySelector,
    isGroupElement,
    getStyleableChildren,
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
    getElementVisibilityStatus,
    toggleElementVisibility,
    toggleGroupVisibility,
    countElements
}: MobileSidebarProps) {
    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full bg-neutral-400/50 backdrop-blur-sm shadow-xl z-50 md:hidden flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/20 bg-neutral-400/70 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold">Editor</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-gray-100"
                        aria-label="Schließen"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Tree Structure */}
                    <details open className="group">
                        <summary className="cursor-pointer font-medium text-white hover:text-gray-200 transition-colors duration-200 select-none flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
                            <span className="transition-transform duration-200 group-open:rotate-90">▶</span>
                            Element Structure ({countElements(treeStructure)} elements)
                        </summary>
                        <div className="mt-2">
                            <ElementStructureTree
                                treeStructure={treeStructure}
                                selectedElementId={selectedElement?.elementId}
                                onElementSelect={onElementSelect}
                                onTreeNodeToggle={onTreeNodeToggle}
                                findElementBySelector={findElementBySelector}
                                isGroupElement={isGroupElement}
                                getStyleableChildren={getStyleableChildren}
                                getElementVisibilityStatus={getElementVisibilityStatus}
                                toggleElementVisibility={toggleElementVisibility}
                                toggleGroupVisibility={toggleGroupVisibility}
                            />
                        </div>
                    </details>

                    {/* Element Editor */}
                    <details open className="group">
                        <summary className="cursor-pointer font-medium text-white hover:text-gray-200 transition-colors duration-200 select-none flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
                            <span className="transition-transform duration-200 group-open:rotate-90">▶</span>
                            Element Editor{selectedElement ? ` (${selectedElement.tagName})` : ''}
                        </summary>
                        <div className="mt-2">
                            <ElementEditor
                                selectedElement={selectedElement}
                                selectedElementSelector={selectedElementSelector}
                                fillColor={fillColor}
                                strokeColor={strokeColor}
                                strokeWidth={strokeWidth}
                                isGradientMode={isGradientMode}
                                gradientConfig={gradientConfig}
                                onFillColorChange={onFillColorChange}
                                onStrokeColorChange={onStrokeColorChange}
                                onStrokeWidthChange={onStrokeWidthChange}
                                onGradientModeChange={onGradientModeChange}
                                onGradientConfigChange={onGradientConfigChange}
                                onDeselect={onDeselect}
                                onRefresh={onRefresh}
                                findElementBySelector={findElementBySelector}
                                isGroupElement={isGroupElement}
                                getStyleableChildren={getStyleableChildren}
                            />
                        </div>
                    </details>
                </div>
            </div>
        </>
    )
}
