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
