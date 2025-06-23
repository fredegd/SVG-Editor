"use client"

import React, { useRef, useCallback } from "react"
import { Upload } from "lucide-react"

interface FileUploadProps {
    onFileUpload: (content: string) => void
    isLoading?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    return (
        <>
            {/* Hidden file input */}
            <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                disabled={isLoading}
            />

            {/* Upload Area */}
            <div
                className="text-center text-gray-500 cursor-pointer p-8 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Upload an SVG file to start editing</p>
                <p className="text-sm text-gray-400">Drag and drop your SVG file here or click to browse</p>
            </div>
        </>
    )
}
