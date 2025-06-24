"use client"

import React, { useCallback } from "react"
import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TreeNodeComponent, TreeNode } from "./TreeNode"

interface ElementStructureTreeProps {
    treeStructure: TreeNode[]
    selectedElementId?: string
    onElementSelect: (elementId: string, uniqueSelector: string) => void
    onTreeNodeToggle: (targetNode: TreeNode) => void
    findElementBySelector: (selector: string) => SVGElement | null
    isGroupElement: (element: SVGElement) => boolean
    getStyleableChildren: (element: SVGElement) => SVGElement[]
    // Visibility functions
    getElementVisibilityStatus: (selector: string) => boolean
    toggleElementVisibility: (selector: string) => void
    toggleGroupVisibility: (selector: string) => void
}

export const ElementStructureTree: React.FC<ElementStructureTreeProps> = ({
    treeStructure,
    selectedElementId,
    onElementSelect,
    onTreeNodeToggle,
    findElementBySelector,
    isGroupElement,
    getStyleableChildren,
    getElementVisibilityStatus,
    toggleElementVisibility,
    toggleGroupVisibility
}) => {
    // Count total elements for display
    const countElements = useCallback((nodes: TreeNode[]): number => {
        let count = 0
        for (const node of nodes) {
            count += 1 + countElements(node.children)
        }
        return count
    }, [])

    const handleElementSelect = useCallback((node: TreeNode) => {
        onElementSelect(node.elementId, node.uniqueSelector)
    }, [onElementSelect])

    return (
        <Card className="max-h-1/2 bg-neutral-100/80 dark:bg-neutral-800/30 overflow-scroll no-scrollbar">
            <CardContent>
                <ScrollArea className="h-[400px] w-full">
                    {treeStructure.length > 0 ? (
                        <div className="space-y-1">
                            {treeStructure.map((node, index) => (
                                <TreeNodeComponent
                                    key={`${node.elementId}-${index}`}
                                    node={node}
                                    depth={0}
                                    selectedElementId={selectedElementId}
                                    onSelect={handleElementSelect}
                                    onToggle={onTreeNodeToggle}
                                    findElementBySelector={findElementBySelector}
                                    isGroupElement={isGroupElement}
                                    getStyleableChildren={getStyleableChildren}
                                    getElementVisibilityStatus={getElementVisibilityStatus}
                                    toggleElementVisibility={toggleElementVisibility}
                                    toggleGroupVisibility={toggleGroupVisibility}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Upload an SVG to see its structure</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
