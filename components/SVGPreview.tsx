"use client"

import React, { useCallback } from "react"
import { Download } from "lucide-react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomControls } from "./ZoomControls"
import { FileUpload } from "./FileUpload"
import type { TreeNode } from "./TreeNode"
import type { SelectedElement } from "../hooks/useSVGEditor"

interface SVGPreviewProps {
    svgContent: string
    svgContainerRef: React.RefObject<HTMLDivElement | null>
    svgElementRef: React.RefObject<SVGSVGElement | null>
    treeStructure: TreeNode[]
    selectedElement: SelectedElement | null
    selectedElementSelector: string
    onFileUpload: (content: string) => void
    onSvgElementClick: (event: React.MouseEvent) => void
    onBackgroundClick: () => void
    onDownload: () => void
    findElementBySelector: (selector: string) => SVGElement | null
}

export const SVGPreview: React.FC<SVGPreviewProps> = ({
    svgContent,
    svgContainerRef,
    svgElementRef,
    selectedElement,
    selectedElementSelector,
    onFileUpload,
    onSvgElementClick,
    onBackgroundClick,
    onDownload,
    findElementBySelector
}) => {
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const files = Array.from(e.dataTransfer.files)
        const svgFile = files.find(file => file.type === "image/svg+xml")

        if (svgFile) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result as string
                onFileUpload(content)
            }
            reader.readAsText(svgFile)
        }
    }, [onFileUpload])

    return (
        <Card className="xl:col-span-4 relative">
            <CardHeader>
                <CardTitle>SVG Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div
                        ref={svgContainerRef}
                        className="min-h-[500px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white overflow-hidden"
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => {
                            if (selectedElement && selectedElementSelector) {
                                const element = findElementBySelector(selectedElementSelector)
                                if (element) {
                                    element.style.outline = ""
                                }
                                onBackgroundClick()
                            }
                        }}
                    >
                        {svgContent ? (
                            <TransformWrapper
                                initialScale={1}
                                minScale={0.1}
                                maxScale={10}
                                centerOnInit={true}
                                wheel={{ step: 0.1 }}
                                pinch={{ step: 0.1 }}
                                doubleClick={{ disabled: false, step: 0.7 }}
                                limitToBounds={false}
                                panning={{ disabled: false, velocityDisabled: false }}
                                velocityAnimation={{ disabled: false }}
                            >
                                {() => (
                                    <>
                                        <ZoomControls />
                                        <TransformComponent
                                            wrapperClass="w-full h-full"
                                            contentClass="w-full h-full flex items-center justify-center"
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{ __html: svgContent }}
                                                onClick={onSvgElementClick}
                                                className="max-w-full max-h-full"
                                                style={{ pointerEvents: 'auto' }}
                                                ref={(el) => {
                                                    if (el) {
                                                        const svg = el.querySelector('svg')
                                                        if (svg && svgElementRef.current !== svg) {
                                                            svgElementRef.current = svg
                                                            console.log("Direct SVG ref set:", svg)
                                                        }
                                                    }
                                                }}
                                            />
                                        </TransformComponent>
                                    </>
                                )}
                            </TransformWrapper>
                        ) : (
                            <FileUpload onFileUpload={onFileUpload} />
                        )}
                    </div>

                    {/* Download Button - Fixed position inside SVG Preview */}
                    {svgContent && (
                        <Button
                            onClick={onDownload}
                            className="absolute bottom-2 right-2 shadow-lg"
                            size="sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
