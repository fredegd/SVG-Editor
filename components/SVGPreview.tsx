"use client"

import React, { useCallback, useRef } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomControls } from "./ZoomControls"
import { FileUpload } from "./FileUpload"
import { DownloadDropdown } from "./DownloadDropdown"
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
    onDownloadSvg: () => void
    onDownloadPng: () => void
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
    onDownloadSvg,
    onDownloadPng,
    findElementBySelector
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (file && file.type === "image/svg+xml") {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const content = e.target?.result as string
                    onFileUpload(content)
                }
                reader.readAsText(file)
            }
        },
        [onFileUpload],
    )
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
        <Card className="xl:col-span-4 relative w-full pb-0">
            {/* Hidden file input */}
            <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
            />

            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>SVG Preview</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadClick}
                        className="flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        {svgContent ? 'Upload New SVG' : 'Upload SVG'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="relative h-full flex flex-col items-center justify-center">
                <div className="relative w-full h-full flex flex-col items-center ">
                    <div
                        ref={svgContainerRef}
                        className="min-h-[500px] w-full border-2 border-dashed mb-2 lg:mb-6 border-gray-300 rounded-lg flex items-center justify-center bg-white overflow-hidden relative "
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
                                                className="max-w-full max-h-full"
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={(e) => {
                                                    // Only handle clicks on SVG elements
                                                    const target = e.target as Element
                                                    if (target && target.tagName && target.namespaceURI === 'http://www.w3.org/2000/svg') {
                                                        // console.log("SVG element clicked:", target)
                                                        onSvgElementClick(e)
                                                    }
                                                }}
                                                ref={(el) => {
                                                    if (el) {
                                                        const svg = el.querySelector('svg')
                                                        if (svg && svgElementRef.current !== svg) {
                                                            svgElementRef.current = svg
                                                            // console.log("Direct SVG ref set:", svg)
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
                </div>
                {/* Download Button - Fixed position inside SVG Preview */}
                {svgContent && (
                    <DownloadDropdown
                        onDownloadSvg={onDownloadSvg}
                        onDownloadPng={onDownloadPng}
                        className="!absolute bottom-1 right-1"
                    />
                )}

            </CardContent>
        </Card>
    )
}
