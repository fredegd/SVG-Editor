"use client"

import React, { useCallback, useState } from "react"
import { ElementStructureTree } from "@/components/ElementStructureTree"
import { ElementEditor } from "@/components/ElementEditor"
import { SVGPreview } from "@/components/SVGPreview"
import { FileUpload } from "@/components/FileUpload"
import { HamburgerButton } from "@/components/HamburgerButton"
import { MobileSidebar } from "@/components/MobileSidebar"
import { useSVGEditor } from "@/hooks/useSVGEditor"
import { useElementUpdates } from "@/hooks/useElementUpdates"
import { downloadSvg, downloadPng } from "@/lib/utils"
import type { TreeNode } from "@/components/TreeNode"
import type { GradientConfig } from "@/components/GradientEditor"

export default function SVGEditor() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const {
    svgContent,
    setSvgContent,
    selectedElement,
    setSelectedElement,
    selectedElementSelector,
    setSelectedElementSelector,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    treeStructure,
    setTreeStructure,
    isGradientMode,
    setIsGradientMode,
    gradientConfig,
    setGradientConfig,
    svgContainerRef,
    svgElementRef,
    getStyleableChildren,
    isGroupElement,
    findElementBySelector,
    // Visibility functions
    getElementVisibilityStatus,
    toggleElementVisibility,
    toggleGroupVisibility
  } = useSVGEditor()

  const {
    updateElementColorOrGradient,
    updateStrokeWidth,
    handleFillColorChange,
    handleStrokeColorChange
  } = useElementUpdates({
    svgContent,
    setSvgContent,
    selectedElement,
    setSelectedElement,
    selectedElementSelector,
    gradientConfig,
    setTreeStructure,
    findElementBySelector,
    isGroupElement,
    getStyleableChildren,
    setFillColor,
    setStrokeColor,
    setStrokeWidth
  })

  // Element selection logic
  const selectElementById = useCallback(
    (elementId: string, uniqueSelector: string) => {
      // console.log("Attempting to select element:", { elementId, uniqueSelector })

      const element = findElementBySelector(uniqueSelector)

      if (!element) {
        console.error("Cannot find element with selector:", uniqueSelector)
        return
      }

      // console.log("Found element:", element)

      // Remove previous selection styling
      if (selectedElement && selectedElementSelector) {
        const prevElement = findElementBySelector(selectedElementSelector)
        if (prevElement) {
          prevElement.style.outline = ""
          // console.log("Removed outline from previous element")
        }
      }

      // Add selection styling
      element.style.outline = "2px solid #3b82f6"
      element.style.outlineOffset = "2px"

      // Get current colors
      const computedStyle = window.getComputedStyle(element)
      const fillAttribute = element.getAttribute("fill")
      const strokeAttribute = element.getAttribute("stroke")
      const strokeWidthAttribute = element.getAttribute("stroke-width")

      let fillValue = fillAttribute
      let strokeValue = strokeAttribute
      let strokeWidthValue = strokeWidthAttribute

      if (!fillValue || fillValue === "none") {
        const computedFill = computedStyle.getPropertyValue("fill")
        if (computedFill && computedFill !== "none") {
          fillValue = computedFill
        }
      }

      if (!strokeValue || strokeValue === "none") {
        const computedStroke = computedStyle.getPropertyValue("stroke")
        if (computedStroke && computedStroke !== "none") {
          strokeValue = computedStroke
        }
      }

      if (!strokeWidthValue) {
        const computedStrokeWidth = computedStyle.getPropertyValue("stroke-width")
        if (computedStrokeWidth) {
          strokeWidthValue = computedStrokeWidth
        }
      }

      // Convert rgb values to hex for color pickers
      const rgbToHex = (rgb: string): string => {
        if (rgb.startsWith('#')) return rgb
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (match) {
          const r = parseInt(match[1])
          const g = parseInt(match[2])
          const b = parseInt(match[3])
          return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
        }
        return rgb
      }

      const selectedEl = {
        elementId,
        tagName: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className?.baseVal || undefined,
        fill: fillValue || "none",
        stroke: strokeValue || "none",
        strokeWidth: strokeWidthValue || "1",
      }

      setSelectedElement(selectedEl)
      setSelectedElementSelector(uniqueSelector)
      setFillColor(fillValue && fillValue !== "none" ? rgbToHex(fillValue) : "#000000")
      setStrokeColor(strokeValue && strokeValue !== "none" ? rgbToHex(strokeValue) : "#000000")
      setStrokeWidth(parseFloat(strokeWidthValue || "1"))

      // console.log("Element selected successfully")
    },
    [selectedElement, selectedElementSelector, findElementBySelector, setSelectedElement, setSelectedElementSelector, setFillColor, setStrokeColor, setStrokeWidth],
  )

  // SVG element click handler
  const handleSvgElementClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      const target = event.target as SVGElement
      // console.log("SVG element clicked:", target, "tagName:", target.tagName, "namespace:", target.namespaceURI)

      // Check if we clicked on an SVG element
      if (!target.tagName ||
        target.namespaceURI !== 'http://www.w3.org/2000/svg' ||
        target.tagName.toLowerCase() === 'svg') {
        // console.log("Clicked on SVG root or non-SVG element, ignoring")
        return
      }

      // Find the tree node that corresponds to this element
      const findNodeByElement = (nodes: TreeNode[], element: SVGElement): TreeNode | null => {
        for (const node of nodes) {
          const nodeElement = findElementBySelector(node.uniqueSelector)
          // console.log("Comparing node:", node.uniqueSelector, "found element:", nodeElement, "with target:", element)

          if (!nodeElement) {
            // console.log("Node element not found for selector:", node.uniqueSelector)
            // Try children recursively
            const childResult = findNodeByElement(node.children, element)
            if (childResult) return childResult
            continue
          }

          // Method 1: DOM reference equality (most reliable but can fail with re-rendered elements)
          if (nodeElement === element) {
            // console.log("Found exact DOM reference match!")
            return node
          }

          // Method 2: ID-based comparison (reliable for elements with IDs)
          if (element.id && element.id.trim() !== '' && element.id === nodeElement.id) {
            // console.log("Found match by ID:", element.id)
            return node
          }

          // Method 3: Position-based comparison for elements without ID
          if (!element.id || element.id.trim() === '') {
            const isElementMatch = (
              nodeElement.tagName === element.tagName &&
              nodeElement.parentElement === element.parentElement &&
              getElementIndex(nodeElement) === getElementIndex(element)
            )

            if (isElementMatch) {
              // console.log("Found match by position and tag for element without ID:", node.uniqueSelector)
              return node
            }
          }

          // Method 4: Attribute-based comparison as fallback
          const attributesMatch = (
            nodeElement.tagName === element.tagName &&
            nodeElement.getAttribute('d') === element.getAttribute('d') &&
            nodeElement.getAttribute('fill') === element.getAttribute('fill') &&
            nodeElement.getAttribute('stroke') === element.getAttribute('stroke') &&
            nodeElement.getAttribute('transform') === element.getAttribute('transform')
          )

          if (attributesMatch) {
            // console.log("Found match by attributes:", node.uniqueSelector)
            return node
          }

          // Recursive search in children
          const childResult = findNodeByElement(node.children, element)
          if (childResult) return childResult
        }
        return null
      }

      // Helper function to get element index among siblings
      const getElementIndex = (element: Element): number => {
        if (!element.parentElement) return 0
        return Array.from(element.parentElement.children).indexOf(element)
      }

      const treeNode = findNodeByElement(treeStructure, target)
      if (treeNode) {
        // console.log("Found matching tree node:", treeNode)
        selectElementById(treeNode.elementId, treeNode.uniqueSelector)
      } else {
        // console.log("No matching tree node found for clicked element. Available tree nodes:", treeStructure.length)
        // Try to log all available selectors for debugging
        // const logAllSelectors = (nodes: TreeNode[], depth = 0) => {
        //   nodes.forEach(node => {
        //     console.log(`${'  '.repeat(depth)}${node.uniqueSelector} (${node.tagName})`)
        //     logAllSelectors(node.children, depth + 1)
        //   })
        // }
        // logAllSelectors(treeStructure)
      }
    },
    [treeStructure, selectElementById, findElementBySelector],
  )

  // Tree node toggle
  const toggleTreeNode = useCallback(
    (targetNode: TreeNode) => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.elementId === targetNode.elementId) {
            return { ...node, isExpanded: !node.isExpanded }
          }
          return { ...node, children: updateNode(node.children) }
        })
      }
      setTreeStructure(updateNode(treeStructure))
    },
    [treeStructure, setTreeStructure],
  )

  // Download SVG wrapper
  const handleDownloadSvg = useCallback(() => {
    if (svgContent) {
      downloadSvg(svgContent)
    }
  }, [svgContent])

  // Download PNG wrapper
  const handleDownloadPng = useCallback(() => {
    if (svgContent) {
      downloadPng(svgContent)
    }
  }, [svgContent])

  // Force refresh the entire SVG
  const refreshSvg = useCallback(() => {
    if (!svgContainerRef.current) return

    const svgElement = svgContainerRef.current.querySelector("svg")
    if (!svgElement) return

    // console.log("Forcing SVG refresh...")

    const parent = svgElement.parentNode
    const nextSibling = svgElement.nextSibling
    if (parent) {
      parent.removeChild(svgElement)
      setTimeout(() => {
        if (nextSibling) {
          parent.insertBefore(svgElement, nextSibling)
        } else {
          parent.appendChild(svgElement)
        }
        // console.log("SVG refresh complete")
      }, 1)
    }
  }, [svgContainerRef])

  // Handle file upload
  const handleFileUpload = useCallback((content: string) => {
    setSvgContent(content)
    setSelectedElement(null)
    setSelectedElementSelector("")
  }, [setSvgContent, setSelectedElement, setSelectedElementSelector])

  // Handle deselect
  const handleDeselect = useCallback(() => {
    if (selectedElement && selectedElementSelector) {
      const element = findElementBySelector(selectedElementSelector)
      if (element) {
        element.style.outline = ""
      }
      setSelectedElement(null)
      setSelectedElementSelector("")
    }
  }, [selectedElement, selectedElementSelector, findElementBySelector, setSelectedElement, setSelectedElementSelector])

  // Handle background click (deselect)
  const handleBackgroundClick = useCallback(() => {
    handleDeselect()
  }, [handleDeselect])

  // Handle gradient mode changes
  const handleGradientModeChange = useCallback((type: 'fill' | 'stroke', enabled: boolean) => {
    setIsGradientMode(prev => {
      const newMode = {
        ...prev,
        [type]: enabled
      }

      // Use requestAnimationFrame to ensure DOM is ready for updates
      requestAnimationFrame(() => {
        updateElementColorOrGradient(type, undefined, enabled)
      })

      return newMode
    })
  }, [setIsGradientMode, updateElementColorOrGradient])

  // Handle gradient config changes
  const handleGradientConfigChange = useCallback((type: 'fill' | 'stroke', config: GradientConfig) => {
    // Update the state immediately
    setGradientConfig(prev => {
      const newConfig = {
        ...prev,
        [type]: config
      }

      // Apply the gradient with the new config immediately
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        updateElementColorOrGradient(type, undefined, true, newConfig)
      })

      return newConfig
    })
  }, [setGradientConfig, updateElementColorOrGradient])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mini SVG Editor</h1>
          <p className="text-gray-600">Upload, edit, and download SVG files</p>
        </div>

        {/* Hamburger Button - nur anzeigen wenn SVG vorhanden */}
        {svgContent && (
          <HamburgerButton
            isOpen={isMobileSidebarOpen}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        )}

        {/* Mobile Sidebar */}
        {svgContent && (
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            treeStructure={treeStructure}
            selectedElement={selectedElement}
            selectedElementSelector={selectedElementSelector}
            onElementSelect={selectElementById}
            onTreeNodeToggle={toggleTreeNode}
            findElementBySelector={findElementBySelector}
            isGroupElement={isGroupElement}
            getStyleableChildren={getStyleableChildren}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            isGradientMode={isGradientMode}
            gradientConfig={gradientConfig}
            onFillColorChange={handleFillColorChange}
            onStrokeColorChange={handleStrokeColorChange}
            onStrokeWidthChange={updateStrokeWidth}
            onGradientModeChange={handleGradientModeChange}
            onGradientConfigChange={handleGradientConfigChange}
            onDeselect={handleDeselect}
            onRefresh={refreshSvg}
            getElementVisibilityStatus={getElementVisibilityStatus}
            toggleElementVisibility={toggleElementVisibility}
            toggleGroupVisibility={toggleGroupVisibility}
          />
        )}

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-1 xl:grid-cols-6 gap-6 p-4">
          {svgContent ? (
            <>
              {/* Left Column: Tree Structure + Element Editor - nur anzeigen wenn SVG vorhanden */}
              <div className="xl:col-span-2 space-y-6">
                {/* Tree Structure */}
                <ElementStructureTree
                  treeStructure={treeStructure}
                  selectedElementId={selectedElement?.elementId}
                  onElementSelect={selectElementById}
                  onTreeNodeToggle={toggleTreeNode}
                  findElementBySelector={findElementBySelector}
                  isGroupElement={isGroupElement}
                  getStyleableChildren={getStyleableChildren}
                  getElementVisibilityStatus={getElementVisibilityStatus}
                  toggleElementVisibility={toggleElementVisibility}
                  toggleGroupVisibility={toggleGroupVisibility}
                />

                {/* Element Editor */}
                <ElementEditor
                  selectedElement={selectedElement}
                  selectedElementSelector={selectedElementSelector}
                  fillColor={fillColor}
                  strokeColor={strokeColor}
                  strokeWidth={strokeWidth}
                  isGradientMode={isGradientMode}
                  gradientConfig={gradientConfig}
                  onFillColorChange={handleFillColorChange}
                  onStrokeColorChange={handleStrokeColorChange}
                  onStrokeWidthChange={updateStrokeWidth}
                  onGradientModeChange={handleGradientModeChange}
                  onGradientConfigChange={handleGradientConfigChange}
                  onDeselect={handleDeselect}
                  onRefresh={refreshSvg}
                  findElementBySelector={findElementBySelector}
                  isGroupElement={isGroupElement}
                  getStyleableChildren={getStyleableChildren}
                />
              </div>

              {/* SVG Display Area */}
              <SVGPreview
                svgContent={svgContent}
                svgContainerRef={svgContainerRef}
                svgElementRef={svgElementRef}
                treeStructure={treeStructure}
                selectedElement={selectedElement}
                selectedElementSelector={selectedElementSelector}
                onFileUpload={handleFileUpload}
                onSvgElementClick={handleSvgElementClick}
                onBackgroundClick={handleBackgroundClick}
                onDownloadSvg={handleDownloadSvg}
                onDownloadPng={handleDownloadPng}
                findElementBySelector={findElementBySelector}
              />
            </>
          ) : (
            /* File Upload Area when no SVG content */
            <div className="xl:col-span-6 flex items-center justify-center min-h-[600px]">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden p-4">
          {svgContent ? (
            /* SVG Display Area - volle Breite auf Mobile */
            <SVGPreview
              svgContent={svgContent}
              svgContainerRef={svgContainerRef}
              svgElementRef={svgElementRef}
              treeStructure={treeStructure}
              selectedElement={selectedElement}
              selectedElementSelector={selectedElementSelector}
              onFileUpload={handleFileUpload}
              onSvgElementClick={handleSvgElementClick}
              onBackgroundClick={handleBackgroundClick}
              onDownloadSvg={handleDownloadSvg}
              onDownloadPng={handleDownloadPng}
              findElementBySelector={findElementBySelector}
            />
          ) : (
            /* File Upload Area when no SVG content on mobile */
            <div className="flex items-center justify-center min-h-[500px]">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
