"use client"

import React from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useControls } from "react-zoom-pan-pinch"

export const ZoomControls: React.FC = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls()

    return (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
                onClick={() => zoomIn()}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
            >
                <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => zoomOut()}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
            >
                <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => resetTransform()}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
            >
                <RotateCcw className="w-4 h-4" />
            </Button>
        </div>
    )
}
