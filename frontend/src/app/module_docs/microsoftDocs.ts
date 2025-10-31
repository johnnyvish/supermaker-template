/**
 * Generated documentation for microsoftDocs module.
 * This file is auto-generated from module_types/microsoftDocs.ts
 */

export const microsoftDocs = {
  moduleName: "microsoftDocs",
  description: "Microsoft Docs API for Word document processing. Create, read, and modify Word documents with advanced formatting. Supports tables, images, headers, footers, and custom styles.",
  userDescription: "Process, generate, and modify Microsoft Word documents with advanced formatting, tables, images, and styles.",
  
  functions: {
    generateDocument: {
      name: "generateDocument",
      description: "Generates a Microsoft Word document.",
      documentation: `
Signature: (options: SimpleDocumentOptions) => Promise<Buffer>
Param Info:
  - options: Document generation options with content and formatting
`
    },
    
    readDocument: {
      name: "readDocument",
      description: "Reads a Microsoft Word document.",
      documentation: `
Signature: (filePath: string | Buffer) => Promise<DocumentStructure>
Param Info:
  - filePath: Path to document file or buffer
`
    },
    
    modifyDocument: {
      name: "modifyDocument",
      description: "Modifies an existing Word document.",
      documentation: `
Signature: (filePath: string | Buffer, modifications: DocumentModification[]) => Promise<Buffer>
Param Info:
  - filePath: Path to document file or buffer
  - modifications: Array of modifications to apply
`
    },
    
    downloadDocument: {
      name: "downloadDocument",
      description: "Downloads a Word document buffer to the user's device.",
      documentation: `
Signature: (buffer: Buffer, options: DownloadDocumentOptions) => Promise<boolean>
Param Info:
  - buffer: Document buffer to download
  - options: Download options including filename
`
    }
  },
  
  types: {
    DocumentStructure: {
      type: "interface",
      description: "",
      properties: {
        paragraphs: "Document paragraphs with formatting",
        tables: "Document tables",
        images: "Document images",
        metadata: "Document metadata",
        rawHtml: "Raw HTML representation"
      }
    },
    TextRun: {
      type: "interface",
      description: "Text run with formatting",
      properties: {
        text: "Text content",
        bold: "Bold formatting",
        italic: "Italic formatting",
        underline: "Underline formatting",
        color: "Text color (hex)",
        size: "Font size in points"
      }
    },
    ParagraphContent: {
      type: "interface",
      description: "Paragraph content type",
      properties: {
        text: "Text content - can be string or formatted text runs",
        heading: "Heading level",
        align: "Text alignment",
        bullet: "Bullet point",
        numbering: "Numbering configuration"
      }
    },
    TableContent: {
      type: "interface",
      description: "Table content type",
      properties: {
        table: "Table data"
      }
    },
    ImageContent: {
      type: "interface",
      description: "Image content type",
      properties: {
        image: "Image data"
      }
    },
    DocumentContentElement: {
      type: "string | \"pageBreak\" | ParagraphContent | TableContent | ImageContent",
      description: "Document content element types"
    },
    ModificationContent: {
      type: "string | ParagraphContent | TableContent | DocumentContentElement[] | { headers?: string[]; rows: string[][] }",
      description: "Document modification content types"
    },
    DocumentModification: {
      type: "interface",
      description: "Document modification operations",
      properties: {
        type: "Type of modification to apply",
        target: "Target element for modification",
        content: "New content to insert or replace",
        metadata: "Metadata updates"
      }
    },
    SimpleDocumentOptions: {
      type: "interface",
      description: "Document generation options",
      properties: {
        content: "Document content elements",
        header: "Document header",
        footer: "Document footer",
        pageNumbers: "Page numbering enabled",
        margins: "Page margins configuration",
        orientation: "Page orientation",
        pageSize: "Page size",
        title: "Document title",
        creator: "Document creator",
        theme: "Document theme configuration"
      }
    },
    DownloadDocumentOptions: {
      type: "interface",
      description: "Download options for the document",
      properties: {
        filename: "Filename for the downloaded document",
        openInNewTab: "Whether to open in new tab instead of downloading (web only)"
      }
    }
  },
  
  example: `
const doc = await Native.microsoftDocs.generateDocument({
content: [
{ text: "My Document", heading: 1 },
"This is a paragraph.",
{ table: { headers: ["Name", "Age"], rows: [["John", "30"]] } }
],
pageNumbers: true
});

// Download the document
await Native.microsoftDocs.downloadDocument(doc, {
filename: "my-document.docx"
});
`
};

// Export for module access
export default microsoftDocs;