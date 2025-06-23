"use client"

import React, { useState } from "react"
import { Download, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DownloadDropdownProps {
    onDownloadSvg: () => void
    onDownloadPng: () => void
    className?: string
}

export const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
    onDownloadSvg,
    onDownloadPng,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleDownload = (type: 'svg' | 'png') => {
        if (type === 'svg') {
            onDownloadSvg()
        } else {
            onDownloadPng()
        }
        setIsOpen(false)
    }

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Main Download Button */}

            <Button
                onClick={toggleDropdown}
                className="shadow-lg flex items-center "
                size="sm"
            >
                <Download className="w-4 h-4 mr-2" />
                <span >
                    Download
                </span>

                <ChevronDown className="w-3 h-3 ml-1" />
            </Button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[130px] overflow-hidden">
                        <div className="py-1">
                            <button
                                onClick={() => handleDownload('svg')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-colors duration-150"
                            >
                                <span className="mr-2 text-blue-500">📄</span>
                                <span className="font-medium">Als SVG</span>
                            </button>
                            <div className="h-px bg-gray-100"></div>
                            <button
                                onClick={() => handleDownload('png')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-colors duration-150"
                            >
                                <span className="mr-2 text-green-500">🖼️</span>
                                <span className="font-medium">Als PNG</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
