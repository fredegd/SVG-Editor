"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TreeNode } from "../components/TreeNode";
import type { GradientConfig } from "../components/GradientEditor";

export interface SelectedElement {
  elementId: string;
  tagName: string;
  id?: string;
  className?: string;
  customName?: string; // For inkscape:name or other custom name attributes
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
}

export const useSVGEditor = () => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);
  const [selectedElementSelector, setSelectedElementSelector] =
    useState<string>("");
  const [fillColor, setFillColor] = useState<string>("#000000");
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(1);
  const [treeStructure, setTreeStructure] = useState<TreeNode[]>([]);

  // Track visibility state for elements
  const [hiddenElements, setHiddenElements] = useState<Set<string>>(new Set());

  // Gradient states
  const [isGradientMode, setIsGradientMode] = useState<{
    fill: boolean;
    stroke: boolean;
  }>({
    fill: false,
    stroke: false,
  });
  const [gradientConfig, setGradientConfig] = useState<{
    fill: GradientConfig;
    stroke: GradientConfig;
  }>({
    fill: {
      type: "linear",
      startColor: "#000000",
      endColor: "#ffffff",
      angle: 0,
    },
    stroke: {
      type: "linear",
      startColor: "#000000",
      endColor: "#ffffff",
      angle: 0,
    },
  });

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgElementRef = useRef<SVGSVGElement | null>(null);

  // Function to get all styleable child elements from a group
  const getStyleableChildren = useCallback(
    (element: SVGElement): SVGElement[] => {
      const styleableElements: SVGElement[] = [];
      const styleableTags = [
        "path",
        "circle",
        "rect",
        "ellipse",
        "polygon",
        "polyline",
        "line",
        "text",
      ];

      const traverse = (el: Element) => {
        if (el.tagName && styleableTags.includes(el.tagName.toLowerCase())) {
          styleableElements.push(el as SVGElement);
        }
        Array.from(el.children).forEach((child) => traverse(child));
      };

      traverse(element);
      return styleableElements;
    },
    []
  );

  // Function to check if selected element is a group with children
  const isGroupElement = useCallback((element: SVGElement): boolean => {
    const groupTags = ["g", "svg"]; // Removed filtered elements like "defs", "clipPath", "mask"
    return (
      groupTags.includes(element.tagName.toLowerCase()) &&
      element.children.length > 0
    );
  }, []);

  // Generate a unique selector for an element
  const generateElementSelector = useCallback((element: SVGElement): string => {
    // First priority: Use existing ID
    if (element.id) {
      return `#${element.id}`;
    }

    // Second priority: Create and use a unique data attribute
    let uniqueId = element.getAttribute("data-svg-element-id");
    if (!uniqueId) {
      // Generate a unique ID based on element position and content
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      uniqueId = `svg-element-${timestamp}-${random}`;
      element.setAttribute("data-svg-element-id", uniqueId);
    }

    // Use the data attribute as selector
    const dataSelector = `[data-svg-element-id="${uniqueId}"]`;
    // console.log("Generated data attribute selector for", element.tagName.toLowerCase(), ":", dataSelector);
    return dataSelector;
  }, []);

  // Generate a unique ID for tracking elements
  const generateElementId = useCallback(
    (element: SVGElement, path: string): string => {
      if (element.id) {
        return `id-${element.id}`;
      }
      return `element-${path}-${element.tagName.toLowerCase()}`;
    },
    []
  );

  // Find an element in the current DOM using its selector
  const findElementBySelector = useCallback(
    (selector: string): SVGElement | null => {
      if (!selector || selector.trim() === "") {
        console.warn("Invalid selector:", selector);
        return null;
      }

      const svgElement =
        svgElementRef.current || svgContainerRef.current?.querySelector("svg");
      if (!svgElement) {
        console.warn("No SVG element found");
        return null;
      }

      try {
        // console.log("Searching for element with selector:", selector, "in SVG:", svgElement);

        let element: SVGElement | null = null;

        // Try to find by selector
        element = svgElement.querySelector(selector) as SVGElement;

        // Fallback for ID selectors
        if (!element && selector.startsWith("#")) {
          const id = selector.substring(1);
          element = svgElement.getElementById(id) as SVGElement;
          // console.log("Tried getElementById for:", id, "result:", element);
        }

        // Fallback for data attribute selectors
        if (!element && selector.includes("data-svg-element-id")) {
          // Try to find all elements with data-svg-element-id and match
          const allElements = svgElement.querySelectorAll(
            "[data-svg-element-id]"
          );
          for (const el of allElements) {
            if (el.matches(selector)) {
              element = el as SVGElement;
              break;
            }
          }
          // console.log("Tried data attribute search for:", selector, "result:", element);
        }

        // console.log("findElementBySelector result:", element, "for selector:", selector);
        return element;
      } catch (error) {
        console.warn("Could not find element with selector:", selector, error);
        return null;
      }
    },
    []
  );

  // Track original SVG content before visibility modifications
  const originalSVGRef = useRef<string>("");

  // Update original SVG when new content is loaded (but not when we modify for visibility)
  useEffect(() => {
    if (svgContent && !svgContent.includes("opacity: 0")) {
      originalSVGRef.current = svgContent;
    }
  }, [svgContent]);

  // Apply visibility changes to SVG content when hiddenElements changes
  useEffect(() => {
    if (!originalSVGRef.current) return;

    let modifiedSVG = originalSVGRef.current;

    // Apply visibility changes to each hidden element
    hiddenElements.forEach((selector) => {
      // Extract the element ID from the selector (remove # prefix if present)
      const elementId = selector.startsWith("#") ? selector.slice(1) : selector;

      // Create a regex to find the element with this ID
      const elementRegex = new RegExp(
        `(<[^>]+id=['"]${elementId}['"][^>]*)(>)`,
        "g"
      );

      modifiedSVG = modifiedSVG.replace(
        elementRegex,
        (match: string, openTag: string, closeTag: string) => {
          // Check if style attribute already exists
          if (openTag.includes("style=")) {
            // Add or update opacity in existing style
            return (
              openTag.replace(
                /style=['"]([^'"]*)['"]/,
                (styleMatch: string, styles: string) => {
                  const cleanStyles = styles
                    .replace(/opacity:\s*[^;]*;?/, "")
                    .trim();
                  const newStyles = cleanStyles
                    ? `${cleanStyles}; opacity: 0`
                    : "opacity: 0";
                  return `style="${newStyles}"`;
                }
              ) + closeTag
            );
          } else {
            // Add new style attribute
            return `${openTag} style="opacity: 0"${closeTag}`;
          }
        }
      );
    });

    // Update SVG content with visibility changes
    setSvgContent(modifiedSVG);
  }, [hiddenElements]);

  // Check if an element is visible based on hiddenElements state
  const isElementVisible = useCallback(
    (selector: string): boolean => {
      return !hiddenElements.has(selector);
    },
    [hiddenElements]
  );

  // Toggle visibility of a single element
  const toggleElementVisibility = useCallback((selector: string): void => {
    setHiddenElements((prev) => {
      const newHiddenElements = new Set(prev);

      if (newHiddenElements.has(selector)) {
        // Show element (remove from hidden set)
        newHiddenElements.delete(selector);
      } else {
        // Hide element (add to hidden set)
        newHiddenElements.add(selector);
      }

      return newHiddenElements;
    });
  }, []);

  // Toggle visibility of a group and all its children
  const toggleGroupVisibility = useCallback((selector: string): void => {
    setHiddenElements((prev) => {
      const newHiddenElements = new Set(prev);

      if (newHiddenElements.has(selector)) {
        // Show group (remove from hidden set)
        newHiddenElements.delete(selector);
      } else {
        // Hide group (add to hidden set)
        newHiddenElements.add(selector);
      }

      return newHiddenElements;
    });
  }, []);

  // Get visibility status for an element (for UI state)
  const getElementVisibilityStatus = useCallback(
    (selector: string): boolean => {
      // Always check DOM state for accurate visibility status
      return isElementVisible(selector);
    },
    [isElementVisible]
  );

  // Define elements to filter out from the tree structure
  const getFilteredElements = useCallback(() => {
    // Elements that are not relevant for color editing
    const irrelevantElements = [
      "defs", // Definitions container
      "metadata", // Metadata container
      "title", // Title element
      "desc", // Description element
      "clipPath", // Clipping path
      "mask", // Mask element
      "pattern", // Pattern definitions
      "marker", // Marker definitions
      "symbol", // Symbol definitions
      "filter", // Filter definitions
      "feGaussianBlur", // Filter effects
      "feOffset",
      "feFlood",
      "feComposite",
      "feMorphology",
      "feColorMatrix",
      "style", // Style elements
      "script", // Script elements
      // Sodipodi and Inkscape specific elements
      "sodipodi:namedview",
      "inkscape:perspective",
      "inkscape:grid",
    ];

    return irrelevantElements;
  }, []);

  // Check if an element should be included in the tree
  const shouldIncludeElement = useCallback(
    (element: SVGElement): boolean => {
      const irrelevantElements = getFilteredElements();
      const tagName = element.tagName.toLowerCase();

      // Filter out irrelevant elements
      if (irrelevantElements.includes(tagName)) {
        return false;
      }

      // Filter out namespaced elements (sodipodi:, inkscape:, etc.)
      if (tagName.includes(":")) {
        return false;
      }

      return true;
    },
    [getFilteredElements]
  );

  // Build tree structure from SVG content
  const buildTreeStructure = useCallback(() => {
    // console.log("=== DEBUG: Building tree structure ===");

    const svgElement =
      svgElementRef.current || svgContainerRef.current?.querySelector("svg");

    if (!svgElement) {
      // console.log("No SVG element found");
      return;
    }

    const buildTreeNode = (
      element: SVGElement,
      path: string,
      index: number
    ): TreeNode => {
      const children: TreeNode[] = [];
      const currentPath = `${path}-${index}`;

      // Filter children and only include relevant elements
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i] as SVGElement;
        if (child.tagName && shouldIncludeElement(child)) {
          children.push(buildTreeNode(child, currentPath, i));
        }
      }

      const elementId = generateElementId(element, currentPath);
      const uniqueSelector = generateElementSelector(element);

      // Extract custom name attributes
      const getCustomName = (el: SVGElement): string | undefined => {
        // Check for inkscape:name attribute (most common)
        const inkscapeName = el.getAttribute("inkscape:name");
        if (inkscapeName) return inkscapeName;

        // Check for inkscape:label as fallback
        const inkscapeLabel = el.getAttribute("inkscape:label");
        if (inkscapeLabel) return inkscapeLabel;

        // Check for generic name attribute
        const genericName = el.getAttribute("name");
        if (genericName) return genericName;

        // Check for aria-label as another fallback
        const ariaLabel = el.getAttribute("aria-label");
        if (ariaLabel) return ariaLabel;

        return undefined;
      };

      const customName = getCustomName(element);

      return {
        tagName: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className?.baseVal || undefined,
        customName,
        children,
        isExpanded: true,
        elementId,
        uniqueSelector,
      };
    };

    const treeNodes: TreeNode[] = [];
    // Filter root level children as well
    for (let i = 0; i < svgElement.children.length; i++) {
      const child = svgElement.children[i] as SVGElement;
      if (child.tagName && shouldIncludeElement(child)) {
        treeNodes.push(buildTreeNode(child, "root", i));
      }
    }

    setTreeStructure(treeNodes);
    // console.log("Tree structure built with", treeNodes.length, "root nodes");

    // Debug: Log all generated selectors
    // const logTreeSelectors = (nodes: TreeNode[], depth = 0) => {
    //   nodes.forEach((node) => {
    //     console.log(`${"  ".repeat(depth)}${node.tagName} -> ${node.uniqueSelector}`);
    //     logTreeSelectors(node.children, depth + 1);
    //   });
    // };
    // console.log("=== All Tree Selectors ===");
    // logTreeSelectors(treeNodes);
  }, [generateElementId, generateElementSelector, shouldIncludeElement]);

  // Build tree structure after SVG content is rendered
  useEffect(() => {
    if (svgContent) {
      const timer = setTimeout(() => {
        // console.log("SVG content changed, rebuilding tree...");
        buildTreeStructure();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [svgContent, buildTreeStructure]);

  return {
    // State
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

    // Refs
    svgContainerRef,
    svgElementRef,

    // Functions
    getStyleableChildren,
    isGroupElement,
    generateElementSelector,
    generateElementId,
    findElementBySelector,
    buildTreeStructure,

    // Visibility functions
    isElementVisible,
    toggleElementVisibility,
    toggleGroupVisibility,
    getElementVisibilityStatus,
  };
};
