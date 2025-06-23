"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface HamburgerButtonProps {
    isOpen: boolean
    onClick: () => void
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="fixed top-4 right-4 z-50 md:hidden"
            aria-label={isOpen ? "Menü schließen" : "Menü öffnen"}
        >
            <div className="flex flex-col justify-center items-center w-4 h-4">
                <span
                    className={`block h-0.5 w-4 bg-current transition-all duration-300 ${isOpen ? "rotate-45 translate-y-1" : ""
                        }`}
                />
                <span
                    className={`block h-0.5 w-4 bg-current transition-all duration-300 mt-1 ${isOpen ? "opacity-0" : ""
                        }`}
                />
                <span
                    className={`block h-0.5 w-4 bg-current transition-all duration-300 mt-1 ${isOpen ? "-rotate-45 -translate-y-1" : ""
                        }`}
                />
            </div>
        </Button>
    )
}
