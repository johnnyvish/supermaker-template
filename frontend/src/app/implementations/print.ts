import type { PrintAPI } from "@/modules/module_types/print";

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

// Create a temporary element for printing
const createPrintElement = (
  htmlContent: string,
  orientation?: "portrait" | "landscape",
  margins?: { top: number; left: number; bottom: number; right: number }
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Failed to open print window - popup blocked?");
  }

  const marginStyle = margins
    ? `margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;`
    : "";

  const orientationStyle =
    orientation === "landscape" ? "@page { size: landscape; }" : "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        <style>
          ${orientationStyle}
          body { 
            ${marginStyle}
            font-family: Arial, sans-serif;
          }
          @media print {
            body { ${marginStyle} }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  return printWindow;
};

// Simple HTML to Canvas conversion for PDF generation (very basic)
const htmlToCanvas = async (
  htmlContent: string
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    tempDiv.style.width = "800px";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.padding = "20px";
    tempDiv.style.fontFamily = "Arial, sans-serif";

    document.body.appendChild(tempDiv);

    // Create canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      document.body.removeChild(tempDiv);
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Set canvas size
    canvas.width = 800;
    canvas.height = Math.max(600, tempDiv.scrollHeight + 40);

    // Fill background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Very basic text rendering (this is quite limited)
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";

    const text = tempDiv.textContent || "";
    const lines = text.split("\n");
    let y = 30;

    lines.forEach((line) => {
      const words = line.split(" ");
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + word + " ";
        const metrics = ctx.measureText(testLine);

        if (metrics.width > 750 && currentLine !== "") {
          ctx.fillText(currentLine, 20, y);
          currentLine = word + " ";
          y += 20;
        } else {
          currentLine = testLine;
        }
      });

      ctx.fillText(currentLine, 20, y);
      y += 20;
    });

    document.body.removeChild(tempDiv);
    resolve(canvas);
  });
};

export const print: PrintAPI = {
  printHtml: async (
    htmlContent: string,
    orientation?: "portrait" | "landscape",
    margins?: { top: number; left: number; bottom: number; right: number }
  ) => {
    console.log(
      `[WEB] Print printHtml: ${htmlContent.length} chars, orientation: ${orientation}`
    );

    if (!isBrowser) {
      throw new Error("Printing requires a browser environment");
    }

    try {
      const printWindow = createPrintElement(htmlContent, orientation, margins);

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 100);
      };

      return true;
    } catch (error) {
      console.warn("Print failed:", error);
      return false;
    }
  },

  generatePdf: async (
    htmlContent: string,
    orientation?: "portrait" | "landscape",
    margins?: { top: number; left: number; bottom: number; right: number },
    width?: number,
    height?: number,
    includeBase64?: boolean
  ) => {
    console.log(`[WEB] Print generatePdf: ${htmlContent.length} chars`);

    if (!isBrowser) {
      throw new Error("PDF generation requires a browser environment");
    }

    try {
      // This is a very basic implementation
      // In a real scenario, you'd use a library like jsPDF or Puppeteer
      const canvas = await htmlToCanvas(htmlContent);
      const dataUrl = canvas.toDataURL("image/png");

      // Create a simple "PDF" (actually just an image)
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const uri = URL.createObjectURL(blob);

      const base64 = includeBase64 ? dataUrl.split(",")[1] : undefined;

      return {
        uri,
        numberOfPages: 1,
        base64,
      };
    } catch (error) {
      console.warn("PDF generation failed:", error);
      throw new Error("PDF generation failed");
    }
  },

  sharePdf: async (uri: string, filename?: string) => {
    console.log(`[WEB] Print sharePdf: ${uri}`);

    if (!isBrowser) {
      throw new Error("Sharing requires a browser environment");
    }

    try {
      // Use Web Share API if available
      if ("share" in navigator) {
        await navigator.share({
          title: filename || "Generated PDF",
          url: uri,
        });
        return true;
      }

      // Fallback: download the file
      const link = document.createElement("a");
      link.href = uri;
      link.download = filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.warn("Share failed:", error);
      return false;
    }
  },

  selectPrinter: async () => {
    console.log("[WEB] Print selectPrinter");

    if (!isBrowser) {
      return null;
    }

    try {
      // Create a hidden iframe to trigger the print dialog without opening a new window
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "1px";
      iframe.style.height = "1px";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";

      document.body.appendChild(iframe);

      // Wait for iframe to load
      return new Promise((resolve) => {
        iframe.onload = () => {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) {
              throw new Error("Cannot access iframe document");
            }

            // Add minimal content to the iframe
            iframeDoc.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Printer Selection</title>
                  <style>
                    body { 
                      font-family: Arial, sans-serif;
                      padding: 20px;
                      text-align: center;
                    }
                  </style>
                </head>
                <body>
                  <h3>Select your printer</h3>
                  <p>This will open the print dialog to select your printer.</p>
                </body>
              </html>
            `);
            iframeDoc.close();

            // Trigger the print dialog from the iframe
            setTimeout(() => {
              try {
                // Focus the iframe window and trigger print
                if (iframe.contentWindow) {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                }

                // Clean up after a short delay
                setTimeout(() => {
                  document.body.removeChild(iframe);
                  resolve({
                    name: "Selected Printer",
                    url: "system://user-selected-printer",
                  });
                }, 1000);
              } catch (printError) {
                document.body.removeChild(iframe);
                console.warn("Print dialog failed:", printError);
                resolve({
                  name: "Default Printer",
                  url: "system://default-printer",
                });
              }
            }, 100);
          } catch (error) {
            document.body.removeChild(iframe);
            console.warn("Iframe setup failed:", error);
            resolve(null);
          }
        };

        // Fallback in case iframe fails to load
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
            resolve(null);
          }
        }, 5000);

        // Set iframe source to trigger load
        iframe.src = "about:blank";
      });
    } catch (error) {
      console.warn("Printer selection failed:", error);
      return null;
    }
  },
};
