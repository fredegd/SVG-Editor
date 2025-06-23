"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TreeNode } from "../components/TreeNode";
import type { GradientConfig } from "../components/GradientEditor";

export interface SelectedElement {
  elementId: string;
  tagName: string;
  id?: string;
  className?: string;
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
    const groupTags = ["g", "svg", "defs", "clipPath", "mask"];
    return (
      groupTags.includes(element.tagName.toLowerCase()) &&
      element.children.length > 0
    );
  }, []);

  // Generate a unique selector for an element
  const generateElementSelector = useCallback(
    (element: SVGElement, index: number): string => {
      const tagName = element.tagName.toLowerCase();

      if (element.id) {
        return `#${element.id}`;
      }

      const parent = element.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.tagName.toLowerCase() === tagName
        );
        const position = siblings.indexOf(element) + 1;
        const parentSelector =
          parent.tagName.toLowerCase() === "svg"
            ? ""
            : `${parent.tagName.toLowerCase()} `;
        return `${parentSelector}${tagName}:nth-of-type(${position})`;
      }

      return `${tagName}:nth-child(${index + 1})`;
    },
    []
  );

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
        let element = svgElement.querySelector(selector) as SVGElement;

        if (!element && selector.startsWith("#")) {
          const id = selector.substring(1);
          element = svgElement.getElementById(id) as SVGElement;
        }

        return element;
      } catch (error) {
        console.warn("Could not find element with selector:", selector, error);
        return null;
      }
    },
    []
  );

  // Build tree structure from SVG content
  const buildTreeStructure = useCallback(() => {
    console.log("=== DEBUG: Building tree structure ===");

    const svgElement =
      svgElementRef.current || svgContainerRef.current?.querySelector("svg");

    if (!svgElement) {
      console.log("No SVG element found");
      return;
    }

    const buildTreeNode = (
      element: SVGElement,
      path: string,
      index: number
    ): TreeNode => {
      const children: TreeNode[] = [];
      const currentPath = `${path}-${index}`;

      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i] as SVGElement;
        if (child.tagName) {
          children.push(buildTreeNode(child, currentPath, i));
        }
      }

      const elementId = generateElementId(element, currentPath);
      const uniqueSelector = generateElementSelector(element, index);

      return {
        tagName: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className?.baseVal || undefined,
        children,
        isExpanded: true,
        elementId,
        uniqueSelector,
      };
    };

    const treeNodes: TreeNode[] = [];
    for (let i = 0; i < svgElement.children.length; i++) {
      const child = svgElement.children[i] as SVGElement;
      if (child.tagName) {
        treeNodes.push(buildTreeNode(child, "root", i));
      }
    }

    setTreeStructure(treeNodes);
    console.log("Tree structure built with", treeNodes.length, "root nodes");
  }, [generateElementId, generateElementSelector]);

  // Build tree structure after SVG content is rendered
  useEffect(() => {
    if (svgContent) {
      const timer = setTimeout(() => {
        console.log("SVG content changed, rebuilding tree...");
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
  };
};
