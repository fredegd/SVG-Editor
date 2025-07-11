"use client"

import React from "react"
import { ChevronRight, ChevronDown, Circle, Square, Zap, FileText, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface TreeNode {
    tagName: string
    id?: string
    className?: string
    customName?: string  // For inkscape:name or other custom name attributes
    children: TreeNode[]
    isExpanded: boolean
    elementId: string
    uniqueSelector: string
}

interface TreeNodeComponentProps {
    node: TreeNode
    depth: number
    selectedElementId?: string
    onSelect: (node: TreeNode) => void
    onToggle: (node: TreeNode) => void
    findElementBySelector: (selector: string) => SVGElement | null
    isGroupElement: (element: SVGElement) => boolean
    getStyleableChildren: (element: SVGElement) => SVGElement[]
    // Visibility functions
    getElementVisibilityStatus: (selector: string) => boolean
    toggleElementVisibility: (selector: string) => void
    toggleGroupVisibility: (selector: string) => void
}

const getElementIcon = (tagName: string) => {
    switch (tagName.toLowerCase()) {
        case "circle":
        case "ellipse":
            return <Circle className="w-4 h-4" />
        case "rect":
        case "polygon":
        case "polyline":
            return <Square className="w-4 h-4" />
        case "path":
            return <Zap className="w-4 h-4" />
        default:
            return <FileText className="w-4 h-4" />
    }
}

export const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
    node,
    depth,
    selectedElementId,
    onSelect,
    onToggle,
    findElementBySelector,
    isGroupElement,
    getStyleableChildren,
    getElementVisibilityStatus,
    toggleElementVisibility,
    toggleGroupVisibility
}) => {
    const hasChildren = node.children.length > 0
    const currentElement = node.uniqueSelector ? findElementBySelector(node.uniqueSelector) : null
    const isSelected = selectedElementId === node.elementId

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer transition-colors ${isSelected
                    ? "bg-blue-100 border border-blue-300 shadow-sm dark:bg-blue-900/30 dark:border-blue-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={() => onSelect(node)}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggle(node)
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded"
                    >
                        {node.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                ) : (
                    <div className="w-4" />
                )}

                <div className={`${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {getElementIcon(node.tagName)}
                </div>

                <span className={`text-sm font-medium ${isSelected ? "text-blue-800 dark:text-blue-200" : "text-red-700 dark:text-gray-300 "
                    }`}>
                    {node.customName || node.tagName}
                </span>
                ---

                {node.id && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                        #{node.id}
                    </Badge>
                )}

                {node.className && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                        .{node.className.split(" ")[0]}
                    </Badge>
                )}

                {/* Show group indicator */}
                {currentElement && isGroupElement(currentElement) && (
                    <Badge variant="default" className="text-xs px-1 py-0 bg-blue-500">
                        Group ({getStyleableChildren(currentElement).length})
                    </Badge>
                )}

                {/* Show current colors as small indicators */}
                <div className="flex gap-1 ml-auto">                    {/* Visibility toggle button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()

                            if (currentElement && isGroupElement(currentElement)) {
                                toggleGroupVisibility(node.uniqueSelector)
                            } else {
                                toggleElementVisibility(node.uniqueSelector)
                            }
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title={getElementVisibilityStatus(node.uniqueSelector) ? "Hide element" : "Show element"}
                    >
                        {getElementVisibilityStatus(node.uniqueSelector) ? (
                            <Eye className="w-3 h-3 text-gray-600" />
                        ) : (
                            <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                    </button>

                    {currentElement && currentElement.getAttribute("fill") && currentElement.getAttribute("fill") !== "none" && (
                        <div
                            className="w-3 h-3 rounded border border-gray-300"
                            style={{ backgroundColor: currentElement.getAttribute("fill") || "#000" }}
                            title={`Fill: ${currentElement.getAttribute("fill")}`}
                        />
                    )}
                    {currentElement && currentElement.getAttribute("stroke") && currentElement.getAttribute("stroke") !== "none" && (
                        <div
                            className="w-3 h-3 rounded border-2"
                            style={{ borderColor: currentElement.getAttribute("stroke") || "#000" }}
                            title={`Stroke: ${currentElement.getAttribute("stroke")}`}
                        />
                    )}
                </div>
            </div>

            {hasChildren && node.isExpanded && (
                <div>
                    {node.children.map((child, index) => (
                        <TreeNodeComponent
                            key={`${child.elementId}-${index}`}
                            node={child}
                            depth={depth + 1}
                            selectedElementId={selectedElementId}
                            onSelect={onSelect}
                            onToggle={onToggle}
                            findElementBySelector={findElementBySelector}
                            isGroupElement={isGroupElement}
                            getStyleableChildren={getStyleableChildren}
                            getElementVisibilityStatus={getElementVisibilityStatus}
                            toggleElementVisibility={toggleElementVisibility}
                            toggleGroupVisibility={toggleGroupVisibility}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
