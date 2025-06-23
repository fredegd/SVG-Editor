import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Downloads SVG content as a file with proper cleaning and validation
 * @param svgContent - The SVG content as string
 * @param filename - Optional filename (default: "edited-svg.svg")
 */
export function downloadSvg(
  svgContent: string,
  filename: string = "edited-svg.svg"
): void {
  if (!svgContent) {
    console.warn("No SVG content to download");
    return;
  }

  try {
    // Create a clean copy of the SVG content for download
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      console.error("Invalid SVG content - using direct method");
      downloadSvgDirect(svgContent, filename);
      return;
    }

    // Remove any outline styles that might have been added for selection
    const allElements = svgElement.querySelectorAll("*");
    allElements.forEach((element) => {
      if (element instanceof SVGElement || element instanceof HTMLElement) {
        element.style.outline = "";
        element.style.outlineOffset = "";
        // Also remove any selection-related classes
        if (element.classList && element.classList.contains("selected")) {
          element.classList.remove("selected");
        }
      }
    });

    // Ensure the SVG has proper namespace and attributes
    if (!svgElement.hasAttribute("xmlns")) {
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    if (!svgElement.hasAttribute("xmlns:xlink")) {
      svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    if (!svgElement.hasAttribute("version")) {
      svgElement.setAttribute("version", "1.1");
    }

    // Serialize the cleaned SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Validate that we have actual SVG content
    if (!svgString.includes("<svg") || svgString.length < 50) {
      console.error("Generated SVG seems invalid - using direct fallback");
      downloadSvgDirect(svgContent, filename);
      return;
    }

    // Add XML declaration for better compatibility
    const finalSvgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

    console.log(
      "Downloading SVG (DOM method):",
      finalSvgString.substring(0, 200) + "..."
    );

    // Create and trigger download
    createDownloadLink(finalSvgString, filename);
  } catch (error) {
    console.error("Error in DOM-based download, using direct method:", error);
    downloadSvgDirect(svgContent, filename);
  }
}

/**
 * Direct download method as fallback - uses string manipulation instead of DOM
 * @param svgContent - The SVG content as string
 * @param filename - Optional filename (default: "edited-svg.svg")
 */
function downloadSvgDirect(
  svgContent: string,
  filename: string = "edited-svg.svg"
): void {
  // Clean the SVG content - remove any selection outlines
  let cleanedSvgContent = svgContent.replace(
    /style\s*=\s*["'][^"']*outline[^"']*["']/gi,
    ""
  );

  // Ensure proper SVG structure
  if (!cleanedSvgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    cleanedSvgContent = cleanedSvgContent.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  // Add XML declaration
  const finalSvgString = cleanedSvgContent.startsWith("<?xml")
    ? cleanedSvgContent
    : `<?xml version="1.0" encoding="UTF-8"?>\n${cleanedSvgContent}`;

  console.log(
    "Downloading SVG (direct method):",
    finalSvgString.substring(0, 200) + "..."
  );

  // Create and trigger download
  createDownloadLink(finalSvgString, filename);
}

/**
 * Creates a download link and triggers the download
 * @param content - The file content
 * @param filename - The filename for download
 */
function createDownloadLink(content: string, filename: string): void {
  const blob = new Blob([content], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Downloads SVG content as PNG file by converting it to canvas
 * @param svgContent - The SVG content as string
 * @param filename - Optional filename (default: "edited-svg.png")
 * @param scale - Scale factor for resolution (default: 4 for high DPI)
 */
export function downloadPng(
  svgContent: string,
  filename: string = "edited-svg.png",
  scale: number = 4
): void {
  if (!svgContent) {
    console.warn("No SVG content to download as PNG");
    return;
  }

  try {
    // Clean the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      console.error("Invalid SVG content for PNG conversion");
      return;
    }

    // Remove any outline styles that might have been added for selection
    const allElements = svgElement.querySelectorAll("*");
    allElements.forEach((element) => {
      if (element instanceof SVGElement || element instanceof HTMLElement) {
        element.style.outline = "";
        element.style.outlineOffset = "";
        if (element.classList && element.classList.contains("selected")) {
          element.classList.remove("selected");
        }
      }
    });

    // Get SVG dimensions
    const svgWidth =
      svgElement.viewBox?.baseVal?.width || svgElement.clientWidth || 800;
    const svgHeight =
      svgElement.viewBox?.baseVal?.height || svgElement.clientHeight || 600;

    // Create canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Cannot create canvas context for PNG conversion");
      return;
    }

    // Set canvas size with scale for better quality
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;

    // Scale the context to maintain proportions
    ctx.scale(scale, scale);

    // Set white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, svgWidth, svgHeight);

    // Convert SVG to data URL
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create image from SVG
    const img = new Image();
    img.onload = () => {
      try {
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

        // Convert canvas to PNG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = filename;
              link.style.display = "none";
              document.body.appendChild(link);
              link.click();

              // Clean up
              setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(svgUrl);
              }, 100);
            } else {
              console.error("Failed to create PNG blob");
            }
          },
          "image/png",
          0.95
        );
      } catch (error) {
        console.error("Error drawing SVG to canvas:", error);
        URL.revokeObjectURL(svgUrl);
      }
    };

    img.onerror = () => {
      console.error("Failed to load SVG as image for PNG conversion");
      URL.revokeObjectURL(svgUrl);
    };

    img.src = svgUrl;
  } catch (error) {
    console.error("Error in PNG conversion:", error);
  }
}
