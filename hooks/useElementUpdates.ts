"use client";

import { useCallback } from "react";
import type { SelectedElement } from "./useSVGEditor";
import type { GradientConfig } from "../components/GradientEditor";
import type { TreeNode } from "../components/TreeNode";

interface UseElementUpdatesProps {
  svgContent: string;
  setSvgContent: (content: string) => void;
  selectedElement: SelectedElement | null;
  setSelectedElement: (
    element:
      | SelectedElement
      | null
      | ((prev: SelectedElement | null) => SelectedElement | null)
  ) => void;
  selectedElementSelector: string;
  gradientConfig: { fill: GradientConfig; stroke: GradientConfig };
  setTreeStructure: (fn: (prev: TreeNode[]) => TreeNode[]) => void;
  findElementBySelector: (selector: string) => SVGElement | null;
  isGroupElement: (element: SVGElement) => boolean;
  getStyleableChildren: (element: SVGElement) => SVGElement[];
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
}

export const useElementUpdates = ({
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
  setStrokeWidth,
}: UseElementUpdatesProps) => {
  // Function to clear all potential CSS overrides from an element
  const clearAllStyles = useCallback((element: SVGElement) => {
    const stylesToClear = [
      "fill",
      "stroke",
      "fill-opacity",
      "stroke-opacity",
      "color",
      "background-color",
      "background",
    ];

    stylesToClear.forEach((prop) => {
      element.style.removeProperty(prop);
    });

    if (
      element.className &&
      typeof element.className === "object" &&
      element.className.baseVal
    ) {
      console.log("Element has CSS classes:", element.className.baseVal);
    }
  }, []);

  // Enhanced updateSvgContent to support stroke-width
  const updateSvgContentEnhanced = useCallback(
    (
      elementId: string,
      property: "fill" | "stroke" | "stroke-width",
      value: string
    ) => {
      if (!svgContent) return;

      console.log(
        `Updating SVG content for element ${elementId}, ${property} to ${value}`
      );

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const targetElement = doc.getElementById(elementId.replace("id-", ""));

      if (targetElement) {
        console.log("Found element in SVG content:", targetElement);

        targetElement.setAttribute(property, value);

        const style = targetElement.getAttribute("style");
        if (style) {
          const styleProps = style.split(";").filter((prop) => {
            const [propName] = prop.split(":").map((p) => p.trim());
            return propName !== property && propName !== `${property}-opacity`;
          });
          targetElement.setAttribute("style", styleProps.join("; "));
        }

        const serializer = new XMLSerializer();
        const newSvgContent = serializer.serializeToString(doc);

        console.log("Updating SVG content with new property");
        setSvgContent(newSvgContent);
      } else {
        console.warn("Could not find element in SVG content:", elementId);
      }
    },
    [svgContent, setSvgContent]
  );

  // Function to create a gradient definition in SVG
  const createGradientDefinition = useCallback(
    (
      gradientId: string,
      type: "linear" | "radial",
      startColor: string,
      endColor: string,
      angle: number = 0
    ): string => {
      if (type === "linear") {
        const radians = (angle * Math.PI) / 180;
        const x1 = 50 + 50 * Math.cos(radians + Math.PI);
        const y1 = 50 + 50 * Math.sin(radians + Math.PI);
        const x2 = 50 + 50 * Math.cos(radians);
        const y2 = 50 + 50 * Math.sin(radians);

        return `<linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
      </linearGradient>`;
      } else {
        return `<radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
      </radialGradient>`;
      }
    },
    []
  );

  // Function to add/update gradient in SVG content
  const updateSvgWithGradient = useCallback(
    (
      elementId: string,
      property: "fill" | "stroke",
      gradientId: string,
      gradientDef: string
    ) => {
      if (!svgContent) return;

      console.log(
        `Adding gradient ${gradientId} for ${property} on element ${elementId}`
      );

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (!svgElement) return;

      let defsElement = svgElement.querySelector("defs");
      if (!defsElement) {
        defsElement = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
        svgElement.insertBefore(defsElement, svgElement.firstChild);
      }

      const existingGradient = defsElement.querySelector(`#${gradientId}`);
      if (existingGradient) {
        defsElement.removeChild(existingGradient);
      }

      const tempDiv = doc.createElement("div");
      tempDiv.innerHTML = gradientDef;
      const gradientElement = tempDiv.firstElementChild;
      if (gradientElement) {
        defsElement.appendChild(doc.importNode(gradientElement, true));
      }

      const targetElement = doc.getElementById(elementId.replace("id-", ""));
      if (targetElement) {
        targetElement.setAttribute(property, `url(#${gradientId})`);

        const style = targetElement.getAttribute("style");
        if (style) {
          const styleProps = style.split(";").filter((prop) => {
            const [propName] = prop.split(":").map((p) => p.trim());
            return propName !== property && propName !== `${property}-opacity`;
          });
          targetElement.setAttribute("style", styleProps.join("; "));
        }
      }

      const serializer = new XMLSerializer();
      const newSvgContent = serializer.serializeToString(doc);

      console.log("Updated SVG with gradient");
      setSvgContent(newSvgContent);
    },
    [svgContent, setSvgContent]
  );

  // Enhanced updateElementColor to support gradients and group styling
  const updateElementColorOrGradient = useCallback(
    (
      property: "fill" | "stroke",
      color?: string,
      useGradient: boolean = false
    ) => {
      if (!selectedElement || !selectedElementSelector) {
        console.error("No element selected");
        return;
      }

      const element = findElementBySelector(selectedElementSelector);
      if (!element) {
        console.error(
          "Cannot find DOM element with selector:",
          selectedElementSelector
        );
        return;
      }

      const isGroup = isGroupElement(element);
      const targetElements = isGroup
        ? getStyleableChildren(element)
        : [element];

      console.log(
        `Updating ${property} for ${targetElements.length} element(s)${
          isGroup ? " (group)" : ""
        }`
      );

      if (useGradient) {
        if (isGroup && svgContent) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgContent, "image/svg+xml");
          const svgElement = doc.querySelector("svg");

          if (svgElement) {
            let defsElement = svgElement.querySelector("defs");
            if (!defsElement) {
              defsElement = doc.createElementNS(
                "http://www.w3.org/2000/svg",
                "defs"
              );
              svgElement.insertBefore(defsElement, svgElement.firstChild);
            }

            targetElements.forEach((targetEl, index) => {
              if (targetEl.id) {
                const config = gradientConfig[property];
                const gradientId = `${property}-gradient-${targetEl.id}-${index}`;
                const gradientDef = createGradientDefinition(
                  gradientId,
                  config.type,
                  config.startColor,
                  config.endColor,
                  config.angle
                );

                const existingGradient = defsElement.querySelector(
                  `#${gradientId}`
                );
                if (existingGradient) {
                  defsElement.removeChild(existingGradient);
                }

                const tempDiv = doc.createElement("div");
                tempDiv.innerHTML = gradientDef;
                const gradientElement = tempDiv.firstElementChild;
                if (gradientElement) {
                  defsElement.appendChild(
                    doc.importNode(gradientElement, true)
                  );
                }

                const targetElement = doc.getElementById(targetEl.id);
                if (targetElement) {
                  targetElement.setAttribute(property, `url(#${gradientId})`);
                  const style = targetElement.getAttribute("style");
                  if (style) {
                    const styleProps = style.split(";").filter((prop) => {
                      const [propName] = prop.split(":").map((p) => p.trim());
                      return (
                        propName !== property &&
                        propName !== `${property}-opacity`
                      );
                    });
                    targetElement.setAttribute("style", styleProps.join("; "));
                  }
                }
              }
            });

            const serializer = new XMLSerializer();
            const newSvgContent = serializer.serializeToString(doc);
            setSvgContent(newSvgContent);
          }
        } else {
          const config = gradientConfig[property];
          const gradientId = `${property}-gradient-${selectedElement.elementId}`;
          const gradientDef = createGradientDefinition(
            gradientId,
            config.type,
            config.startColor,
            config.endColor,
            config.angle
          );
          updateSvgWithGradient(
            selectedElement.elementId,
            property,
            gradientId,
            gradientDef
          );
        }
        console.log(
          `Applied ${gradientConfig[property].type} gradient to ${targetElements.length} element(s)`
        );
      } else if (color) {
        targetElements.forEach((targetEl) => {
          try {
            clearAllStyles(targetEl);
            targetEl.removeAttribute(property);
            targetEl.getBoundingClientRect();
            targetEl.setAttribute(property, color);
            targetEl.style.setProperty(property, color, "important");
          } catch (error) {
            console.error("Error setting color on element:", targetEl, error);
          }
        });

        if (svgContent && isGroup) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgContent, "image/svg+xml");

          targetElements.forEach((targetEl) => {
            if (targetEl.id) {
              const targetElement = doc.getElementById(targetEl.id);
              if (targetElement) {
                targetElement.setAttribute(property, color);
                const style = targetElement.getAttribute("style");
                if (style) {
                  const styleProps = style.split(";").filter((prop) => {
                    const [propName] = prop.split(":").map((p) => p.trim());
                    return (
                      propName !== property &&
                      propName !== `${property}-opacity`
                    );
                  });
                  targetElement.setAttribute("style", styleProps.join("; "));
                }
              }
            }
          });

          const serializer = new XMLSerializer();
          const newSvgContent = serializer.serializeToString(doc);
          setSvgContent(newSvgContent);
        } else if (!isGroup && targetElements[0]?.id) {
          updateSvgContentEnhanced(
            `id-${targetElements[0].id}`,
            property,
            color
          );
        }

        setSelectedElement((prev: SelectedElement | null) =>
          prev ? { ...prev, [property]: color } : null
        );
        console.log(
          `Successfully updated ${property} to ${color} for ${targetElements.length} element(s)`
        );
        setTreeStructure((prev) => [...prev]);
      }
    },
    [
      selectedElement,
      selectedElementSelector,
      gradientConfig,
      createGradientDefinition,
      updateSvgWithGradient,
      findElementBySelector,
      clearAllStyles,
      updateSvgContentEnhanced,
      isGroupElement,
      getStyleableChildren,
      svgContent,
      setSvgContent,
      setSelectedElement,
      setTreeStructure,
    ]
  );

  // Function to update stroke width with group support
  const updateStrokeWidth = useCallback(
    (width: number) => {
      if (!selectedElement || !selectedElementSelector) {
        console.error("No element selected");
        return;
      }

      const element = findElementBySelector(selectedElementSelector);
      if (!element) {
        console.error(
          "Cannot find DOM element with selector:",
          selectedElementSelector
        );
        return;
      }

      const isGroup = isGroupElement(element);
      const targetElements = isGroup
        ? getStyleableChildren(element)
        : [element];

      console.log(
        `Updating stroke width to ${width} for ${
          targetElements.length
        } element(s)${isGroup ? " (group)" : ""}`
      );

      targetElements.forEach((targetEl) => {
        try {
          targetEl.style.removeProperty("stroke-width");
          targetEl.setAttribute("stroke-width", width.toString());
          targetEl.style.setProperty(
            "stroke-width",
            width.toString(),
            "important"
          );
        } catch (error) {
          console.error(
            "Error setting stroke width on element:",
            targetEl,
            error
          );
        }
      });

      if (svgContent && isGroup) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");

        targetElements.forEach((targetEl) => {
          if (targetEl.id) {
            const targetElement = doc.getElementById(targetEl.id);
            if (targetElement) {
              targetElement.setAttribute("stroke-width", width.toString());
              const style = targetElement.getAttribute("style");
              if (style) {
                const styleProps = style.split(";").filter((prop) => {
                  const [propName] = prop.split(":").map((p) => p.trim());
                  return (
                    propName !== "stroke-width" &&
                    propName !== "stroke-width-opacity"
                  );
                });
                targetElement.setAttribute("style", styleProps.join("; "));
              }
            }
          }
        });

        const serializer = new XMLSerializer();
        const newSvgContent = serializer.serializeToString(doc);
        setSvgContent(newSvgContent);
      } else if (!isGroup && targetElements[0]?.id) {
        updateSvgContentEnhanced(
          `id-${targetElements[0].id}`,
          "stroke-width",
          width.toString()
        );
      }

      setSelectedElement((prev: SelectedElement | null) =>
        prev ? { ...prev, strokeWidth: width.toString() } : null
      );
      setStrokeWidth(width);

      console.log(
        `Successfully updated stroke width to ${width} for ${targetElements.length} element(s)`
      );
      setTreeStructure((prev) => [...prev]);
    },
    [
      selectedElement,
      selectedElementSelector,
      findElementBySelector,
      updateSvgContentEnhanced,
      isGroupElement,
      getStyleableChildren,
      svgContent,
      setSvgContent,
      setSelectedElement,
      setStrokeWidth,
      setTreeStructure,
    ]
  );

  const handleFillColorChange = useCallback(
    (color: string) => {
      setFillColor(color);
      updateElementColorOrGradient("fill", color, false);
    },
    [updateElementColorOrGradient, setFillColor]
  );

  const handleStrokeColorChange = useCallback(
    (color: string) => {
      setStrokeColor(color);
      updateElementColorOrGradient("stroke", color, false);
    },
    [updateElementColorOrGradient, setStrokeColor]
  );

  return {
    updateElementColorOrGradient,
    updateStrokeWidth,
    handleFillColorChange,
    handleStrokeColorChange,
    clearAllStyles,
    updateSvgContentEnhanced,
    createGradientDefinition,
    updateSvgWithGradient,
  };
};
