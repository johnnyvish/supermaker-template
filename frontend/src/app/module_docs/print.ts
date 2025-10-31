/**
 * Generated documentation for print module.
 * This file is auto-generated from module_types/print.ts
 */

export const print = {
  moduleName: "print",
  description: "Print API for document printing. Generates PDFs from HTML and sends to printers. Supports custom page sizes and margins.",
  userDescription: "Generate PDFs from HTML content and print documents to connected printers with custom formatting.",
  
  functions: {
    printHtml: {
      name: "printHtml",
      description: "Prints HTML content.",
      documentation: `
Signature: (htmlContent: string, orientation?: PageOrientation, margins?: PageMargins, printerUrl?: string) => Promise<boolean>
Param Info:
  - htmlContent: HTML to print
  - orientation: Page orientation
  - margins: Page margins
  - printerUrl: Specific printer
`
    },
    
    generatePdf: {
      name: "generatePdf",
      description: "Generates PDF from HTML.",
      documentation: `
Signature: (htmlContent: string, orientation?: PageOrientation, margins?: PageMargins, width?: number, height?: number, includeBase64?: boolean) => Promise<PdfResult>
Param Info:
  - htmlContent: HTML content
  - orientation: Page orientation
  - margins: Page margins
  - width: Page width
  - height: Page height
  - includeBase64: Include base64
`
    },
    
    sharePdf: {
      name: "sharePdf",
      description: "Shares PDF file.",
      documentation: `
Signature: (uri: string, filename?: string) => Promise<boolean>
Param Info:
  - uri: PDF file URI
  - filename: Suggested filename
`
    },
    
    selectPrinter: {
      name: "selectPrinter",
      description: "Shows printer selection UI.",
      documentation: `
Signature: () => Promise<PrinterInfo | null>
`
    }
  },
  
  types: {
    PageOrientation: {
      type: "\"portrait\" | \"landscape\"",
      description: ""
    },
    PageMargins: {
      type: "interface",
      description: "Page margins in points",
      properties: {
        top: "Top margin",
        left: "Left margin",
        bottom: "Bottom margin",
        right: "Right margin"
      }
    },
    PdfResult: {
      type: "interface",
      description: "Generated PDF result",
      properties: {
        uri: "PDF file URI",
        numberOfPages: "Total page count",
        base64: "Optional base64 data"
      }
    },
    PrinterInfo: {
      type: "interface",
      description: "Selected printer info",
      properties: {
        name: "Printer name",
        url: "Printer URL"
      }
    }
  },
  
  example: `
const pdf = await Native.print.generatePdf(
"<h1>Report</h1>", "portrait"
);
await Native.print.sharePdf(pdf.uri, "report.pdf");
`
};

// Export for module access
export default print;