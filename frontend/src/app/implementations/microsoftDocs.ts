// Local minimal types to keep this file self-contained
type ParagraphContent = {
    text:
        | string
        | Array<{
              text: string;
              bold?: boolean;
              italic?: boolean;
              underline?: boolean;
              color?: string;
              size?: number;
          }>;
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
    align?: 'left' | 'center' | 'right' | 'justify';
    bullet?: boolean;
    numbering?: unknown;
};

type SimpleDocumentOptions = {
    title?: string;
    creator?: string;
    content: Array<
        | string
        | ParagraphContent
        | {
              table: {
                  headers?: string[];
                  rows: (string | ParagraphContent)[][];
              };
          }
        | {
              image: {
                  data: Buffer | ArrayBuffer | string;
                  width: number;
                  height: number;
                  type?: 'jpg' | 'png' | 'gif' | 'bmp';
              };
          }
    >;
    margins?:
        | { top: number; bottom: number; left: number; right: number }
        | 'normal'
        | 'narrow'
        | 'wide';
    pageSize?: 'letter' | 'a4' | 'legal' | 'a3';
    orientation?: 'portrait' | 'landscape';
    header?: string | ParagraphContent;
    footer?: string | ParagraphContent;
    pageNumbers?: boolean;
    theme?: {
        primaryColor?: string;
        accentColor?: string;
        fontFamily?: string;
        headingFont?: string;
        fontSize?: number;
        lineSpacing?: number;
        tableStyle?: 'professional' | 'simple' | 'none';
    };
};

type DocumentStructure = {
    paragraphs: Array<{
        text: string;
        type:
            | 'normal'
            | 'heading1'
            | 'heading2'
            | 'heading3'
            | 'heading4'
            | 'heading5'
            | 'heading6';
        style?: { bold?: boolean; italic?: boolean; underline?: boolean };
        index: number;
    }>;
    tables: Array<{ headers: string[]; rows: string[][]; index: number }>;
    images: Array<unknown>;
    metadata: Record<string, unknown>;
    rawHtml: string;
};

type DocumentModification =
    | {
          type: 'replaceText';
          target?: { text?: string; contains?: string };
          content?: string;
      }
    | {
          type: 'replaceParagraph';
          target: { index: number };
          content?: string | ParagraphContent;
      }
    | { type: 'deleteParagraph'; target: { index: number } }
    | {
          type: 'insertParagraph';
          target: { index: number };
          content: string | ParagraphContent;
      }
    | {
          type: 'replaceTable';
          target: { index: number };
          content: { headers?: string[]; rows?: string[][] };
      }
    | {
          type: 'appendContent';
          content: Array<string | ParagraphContent> | string | ParagraphContent;
      }
    | {
          type: 'prependContent';
          content: Array<string | ParagraphContent> | string | ParagraphContent;
      }
    | {
          type: 'updateMetadata';
          metadata?: { title?: string; creator?: string };
      };

type DownloadDocumentOptions = { filename: string; openInNewTab?: boolean };
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    Header,
    Footer,
    ImageRun,
    PageBreak,
    convertInchesToTwip,
    ISectionOptions,
    IPropertiesOptions,
    IParagraphOptions,
    IRunOptions,
    PageOrientation,
    ISectionPropertiesOptions,
    PageNumber,
    LevelFormat,
    convertMillimetersToTwip,
    WidthType,
    ShadingType,
} from 'docx';
import * as mammoth from 'mammoth';

// Helper functions for document creation
function createParagraph(para: ParagraphContent): Paragraph {
    const children: TextRun[] = [];

    if (typeof para.text === 'string') {
        children.push(new TextRun({ text: para.text }));
    } else {
        para.text.forEach((run) => {
            const runOptions: IRunOptions = {
                text: run.text,
                bold: run.bold,
                italics: run.italic,
                underline: run.underline ? {} : undefined,
                color: run.color,
                size: run.size ? run.size * 2 : undefined, // Convert pt to half-points
            };
            children.push(new TextRun(runOptions));
        });
    }

    const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
    };

    const alignMap = {
        left: AlignmentType.LEFT,
        center: AlignmentType.CENTER,
        right: AlignmentType.RIGHT,
        justify: AlignmentType.JUSTIFIED,
    };

    // Add professional spacing based on heading level
    let spacing = {};
    if (para.heading === 1) {
        spacing = { before: 480, after: 240 }; // 24pt before, 12pt after
    } else if (para.heading === 2) {
        spacing = { before: 360, after: 180 }; // 18pt before, 9pt after
    } else if (para.heading === 3) {
        spacing = { before: 240, after: 120 }; // 12pt before, 6pt after
    } else {
        spacing = { after: 120 }; // 6pt after for regular paragraphs
    }

    const paragraphOptions: IParagraphOptions = {
        children,
        heading: para.heading ? headingMap[para.heading] : undefined,
        alignment: para.align ? alignMap[para.align] : undefined,
        bullet: para.bullet ? { level: 0 } : undefined,
        numbering: para.numbering ? para.numbering : undefined,
        spacing,
    };

    return new Paragraph(paragraphOptions);
}

function createTable(
    tableData: {
        headers?: string[];
        rows: (string | ParagraphContent)[][];
    },
    theme: {
        primaryColor: string;
        tableStyle: string;
        fontSize: number;
    }
): Table {
    const rows: TableRow[] = [];

    // Add header row if provided
    if (tableData.headers) {
        if (theme.tableStyle === 'none') {
            // Simple headers without styling for "none" style
            rows.push(
                new TableRow({
                    children: tableData.headers.map(
                        (header) =>
                            new TableCell({
                                children: [new Paragraph({ text: header })],
                            })
                    ),
                    tableHeader: true,
                })
            );
        } else {
            const headerStyle =
                theme.tableStyle === 'simple'
                    ? { bold: true, size: theme.fontSize * 2 }
                    : { bold: true, color: 'FFFFFF', size: theme.fontSize * 2 };

            const headerShading =
                theme.tableStyle === 'simple'
                    ? undefined
                    : {
                          type: ShadingType.SOLID,
                          color: theme.primaryColor,
                          fill: theme.primaryColor,
                      };

            rows.push(
                new TableRow({
                    children: tableData.headers.map(
                        (header) =>
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: header,
                                                ...headerStyle,
                                            }),
                                        ],
                                        alignment:
                                            theme.tableStyle === 'professional'
                                                ? AlignmentType.CENTER
                                                : undefined,
                                    }),
                                ],
                                shading: headerShading,
                                margins: {
                                    top: convertInchesToTwip(0.05),
                                    bottom: convertInchesToTwip(0.05),
                                    left: convertInchesToTwip(0.1),
                                    right: convertInchesToTwip(0.1),
                                },
                            })
                    ),
                    tableHeader: true,
                    height: { value: 600, rule: 'atLeast' as const },
                })
            );
        }
    }

    // Add data rows with alternating colors (only for professional style)
    tableData.rows.forEach((row, index) => {
        rows.push(
            new TableRow({
                children: row.map((cell) => {
                    const content =
                        typeof cell === 'string'
                            ? [
                                  new Paragraph({
                                      text: cell,
                                      spacing: { after: 60 },
                                  }),
                              ]
                            : [createParagraph(cell as ParagraphContent)];

                    const shouldShade =
                        theme.tableStyle === 'professional' && index % 2 === 0;
                    return new TableCell({
                        children: content,
                        shading: shouldShade
                            ? {
                                  type: ShadingType.SOLID,
                                  color: 'F5F5F5',
                                  fill: 'F5F5F5',
                              }
                            : undefined,
                        margins: {
                            top: convertInchesToTwip(0.05),
                            bottom: convertInchesToTwip(0.05),
                            left: convertInchesToTwip(0.1),
                            right: convertInchesToTwip(0.1),
                        },
                    });
                }),
            })
        );
    });

    return new Table({
        rows,
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        margins: {
            top: convertInchesToTwip(0.1),
            bottom: convertInchesToTwip(0.1),
            left: convertInchesToTwip(0),
            right: convertInchesToTwip(0),
        },
    });
}

function createImage(imageData: {
    data: Buffer | ArrayBuffer | string;
    width: number;
    height: number;
    type?: 'jpg' | 'png' | 'gif' | 'bmp';
}): Paragraph {
    return new Paragraph({
        children: [
            new ImageRun({
                type: imageData.type || 'png', // Default to PNG if not specified
                data: imageData.data,
                transformation: {
                    width: imageData.width,
                    height: imageData.height,
                },
            }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 }, // 12pt spacing around images
    });
}

// Helper function to convert structure paragraph to document content
const convertParagraphToContent = (
    para: DocumentStructure['paragraphs'][0]
): SimpleDocumentOptions['content'][0] => {
    const textRuns: {
        text: string;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
    }[] = [];
    if (para.style?.bold || para.style?.italic || para.style?.underline) {
        textRuns.push({
            text: para.text,
            bold: para.style.bold,
            italic: para.style.italic,
            underline: para.style.underline,
        });
    }

    const heading: 1 | 2 | 3 | 4 | 5 | 6 | undefined =
        para.type === 'heading1'
            ? 1
            : para.type === 'heading2'
            ? 2
            : para.type === 'heading3'
            ? 3
            : para.type === 'heading4'
            ? 4
            : para.type === 'heading5'
            ? 5
            : para.type === 'heading6'
            ? 6
            : undefined;

    if (heading) {
        return {
            text: textRuns.length > 0 ? textRuns : para.text,
            heading,
        } as SimpleDocumentOptions['content'][0];
    } else if (textRuns.length > 0) {
        return { text: textRuns } as SimpleDocumentOptions['content'][0];
    } else {
        return para.text;
    }
};

// Main implementation
export const microsoftDocs = {
    generateDocument: async (
        options: SimpleDocumentOptions
    ): Promise<Buffer> => {
        console.log('[WEB] Microsoft Docs generateDocument');

        // Extract theme options with defaults
        const theme = {
            primaryColor: options.theme?.primaryColor || '2E74B5',
            accentColor: options.theme?.accentColor || '1F4E79',
            fontFamily: options.theme?.fontFamily || 'Calibri',
            headingFont: options.theme?.headingFont || 'Calibri Light',
            fontSize: options.theme?.fontSize || 11,
            lineSpacing: options.theme?.lineSpacing || 1.15,
            tableStyle: options.theme?.tableStyle || 'professional',
        };

        const children: (Paragraph | Table)[] = [];

        // Process content
        for (const item of options.content) {
            if (typeof item === 'string') {
                if (item === 'pageBreak') {
                    children.push(
                        new Paragraph({ children: [new PageBreak()] })
                    );
                } else {
                    children.push(new Paragraph({ text: item }));
                }
            } else if ('text' in item) {
                children.push(createParagraph(item as ParagraphContent));
            } else if ('table' in item) {
                children.push(createTable(item.table, theme));
            } else if ('image' in item) {
                children.push(createImage(item.image));
            }
        }

        // Set page properties
        const marginPresets = {
            normal: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            narrow: { top: 720, bottom: 720, left: 720, right: 720 },
            wide: { top: 1440, bottom: 1440, left: 2160, right: 2160 },
        };

        // Handle custom margins or presets
        let margins;
        if (typeof options.margins === 'object') {
            margins = {
                top: convertInchesToTwip(options.margins.top),
                bottom: convertInchesToTwip(options.margins.bottom),
                left: convertInchesToTwip(options.margins.left),
                right: convertInchesToTwip(options.margins.right),
            };
        } else if (options.margins) {
            margins = marginPresets[options.margins];
        }

        // Page size configurations
        const pageSizes = {
            letter: { width: 8.5, height: 11 },
            a4: { width: 8.27, height: 11.69 },
            legal: { width: 8.5, height: 14 },
            a3: { width: 11.69, height: 16.54 },
        };

        const pageSize = options.pageSize
            ? pageSizes[options.pageSize]
            : pageSizes.letter;

        // Build section properties
        const sectionProperties: ISectionPropertiesOptions | undefined =
            margins || options.orientation || options.pageSize
                ? {
                      page: {
                          margin: margins,
                          size:
                              options.orientation === 'landscape'
                                  ? {
                                        orientation: PageOrientation.LANDSCAPE,
                                        width: convertInchesToTwip(
                                            pageSize.height
                                        ),
                                        height: convertInchesToTwip(
                                            pageSize.width
                                        ),
                                    }
                                  : {
                                        width: convertInchesToTwip(
                                            pageSize.width
                                        ),
                                        height: convertInchesToTwip(
                                            pageSize.height
                                        ),
                                    },
                      },
                  }
                : undefined;

        // Build headers
        const headers: ISectionOptions['headers'] = options.header
            ? {
                  default: new Header({
                      children:
                          typeof options.header === 'string'
                              ? [new Paragraph({ text: options.header })]
                              : [
                                    createParagraph(
                                        options.header as ParagraphContent
                                    ),
                                ],
                  }),
              }
            : undefined;

        // Build footers with optional page numbers
        let footers: ISectionOptions['footers'] = undefined;
        if (options.footer || options.pageNumbers) {
            const footerChildren: Paragraph[] = [];

            if (options.footer) {
                if (typeof options.footer === 'string') {
                    footerChildren.push(
                        new Paragraph({ text: options.footer })
                    );
                } else {
                    footerChildren.push(
                        createParagraph(options.footer as ParagraphContent)
                    );
                }
            }

            if (options.pageNumbers) {
                footerChildren.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun('Page '),
                            new TextRun({
                                children: [PageNumber.CURRENT],
                            }),
                            new TextRun(' of '),
                            new TextRun({
                                children: [PageNumber.TOTAL_PAGES],
                            }),
                        ],
                    })
                );
            }

            footers = {
                default: new Footer({ children: footerChildren }),
            };
        }

        // Create document sections
        const sections: ISectionOptions[] = [
            {
                children,
                properties: sectionProperties,
                headers,
                footers,
            },
        ];

        // Check if we need numbering
        const hasNumbering = options.content.some(
            (item) => typeof item === 'object' && 'numbering' in item
        );

        // Calculate line spacing in twips (240 = single spacing)
        const lineSpacingValue = Math.round(240 * theme.lineSpacing);

        // Create document with numbering and professional styles
        const docConfig: IPropertiesOptions = {
            sections,
            title: options.title,
            creator: options.creator,
            styles: {
                default: {
                    document: {
                        run: {
                            font: theme.fontFamily,
                            size: theme.fontSize * 2, // Convert to half-points
                        },
                        paragraph: {
                            spacing: {
                                line: lineSpacingValue,
                            },
                        },
                    },
                    heading1: {
                        run: {
                            font: theme.headingFont,
                            size: Math.round(theme.fontSize * 1.5) * 2, // 1.5x base size
                            color: theme.primaryColor,
                            bold: true,
                        },
                    },
                    heading2: {
                        run: {
                            font: theme.headingFont,
                            size: Math.round(theme.fontSize * 1.3) * 2, // 1.3x base size
                            color: theme.primaryColor,
                            bold: true,
                        },
                    },
                    heading3: {
                        run: {
                            font: theme.fontFamily,
                            size: Math.round(theme.fontSize * 1.1) * 2, // 1.1x base size
                            color: theme.accentColor,
                            bold: true,
                        },
                    },
                },
            },
            numbering: hasNumbering
                ? {
                      config: [
                          {
                              reference: 'default',
                              levels: [
                                  {
                                      level: 0,
                                      format: LevelFormat.DECIMAL,
                                      text: '%1.',
                                      alignment: AlignmentType.LEFT,
                                      style: {
                                          paragraph: {
                                              indent: {
                                                  left: convertMillimetersToTwip(
                                                      10
                                                  ),
                                                  hanging:
                                                      convertMillimetersToTwip(
                                                          5
                                                      ),
                                              },
                                          },
                                      },
                                  },
                                  {
                                      level: 1,
                                      format: LevelFormat.LOWER_LETTER,
                                      text: '%2.',
                                      alignment: AlignmentType.LEFT,
                                      style: {
                                          paragraph: {
                                              indent: {
                                                  left: convertMillimetersToTwip(
                                                      20
                                                  ),
                                                  hanging:
                                                      convertMillimetersToTwip(
                                                          5
                                                      ),
                                              },
                                          },
                                      },
                                  },
                              ],
                          },
                      ],
                  }
                : undefined,
        };

        const document = new Document(docConfig);
        return await Packer.toBuffer(document);
    },

    readDocument: async (
        filePath: string | Buffer
    ): Promise<DocumentStructure> => {
        console.log('[WEB] Microsoft Docs readDocument');

        let buffer: Buffer;

        // Handle different input types
        if (typeof filePath === 'string') {
            throw new Error(
                'File path reading is not supported in web implementation. Please provide a Buffer.'
            );
        } else if (filePath instanceof Uint8Array) {
            // Convert Uint8Array to Buffer
            buffer = Buffer.from(filePath);
        } else {
            // Already a Buffer
            buffer = filePath;
        }

        // Extract HTML and messages from the document
        let result;
        try {
            // Convert buffer to ArrayBuffer for mammoth
            const arrayBuffer = new ArrayBuffer(buffer.byteLength);
            const uint8View = new Uint8Array(arrayBuffer);
            uint8View.set(buffer);
            result = await mammoth.convertToHtml({ arrayBuffer });
        } catch (error) {
            console.error('Mammoth conversion error:', error);
            // Try with buffer directly as fallback
            try {
                result = await mammoth.convertToHtml({ buffer });
            } catch (bufferError) {
                console.error('Mammoth buffer conversion error:', bufferError);
                // Last attempt: try passing the raw buffer data
                try {
                    const uint8Array = new Uint8Array(buffer);
                    const arrayBuffer = uint8Array.buffer.slice(
                        uint8Array.byteOffset,
                        uint8Array.byteOffset + uint8Array.byteLength
                    );
                    result = await mammoth.convertToHtml({ arrayBuffer });
                } catch (finalError) {
                    console.error(
                        'Mammoth final conversion error:',
                        finalError
                    );
                    throw new Error(
                        `Failed to read document: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`
                    );
                }
            }
        }

        // Parse the HTML to extract structure
        const structure: DocumentStructure = {
            paragraphs: [],
            tables: [],
            images: [],
            metadata: {},
            rawHtml: result.value,
        };

        // Parse HTML to extract paragraphs and tables
        let elementIndex = 0;
        const htmlLines = result.value
            .split(/<\/[^>]+>/)
            .filter((line) => line.trim());

        htmlLines.forEach((line) => {
            // Clean the line
            const cleanLine = line.replace(/<[^>]+>/g, '').trim();
            if (!cleanLine) return;

            // Detect headings
            if (line.includes('<h1')) {
                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'heading1',
                    index: elementIndex++,
                });
            } else if (line.includes('<h2')) {
                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'heading2',
                    index: elementIndex++,
                });
            } else if (line.includes('<h3')) {
                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'heading3',
                    index: elementIndex++,
                });
            } else if (line.includes('<h4')) {
                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'heading4',
                    index: elementIndex++,
                });
            } else if (line.includes('<h5')) {
                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'heading5',
                    index: elementIndex++,
                });
            } else if (line.includes('<h6')) {
                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'heading6',
                    index: elementIndex++,
                });
            } else if (line.includes('<p') || !line.includes('<')) {
                // Detect text styling
                const style: {
                    bold?: boolean;
                    italic?: boolean;
                    underline?: boolean;
                } = {};
                if (line.includes('<strong>') || line.includes('<b>'))
                    style.bold = true;
                if (line.includes('<em>') || line.includes('<i>'))
                    style.italic = true;
                if (line.includes('<u>')) style.underline = true;

                structure.paragraphs.push({
                    text: cleanLine,
                    type: 'normal',
                    style: Object.keys(style).length > 0 ? style : undefined,
                    index: elementIndex++,
                });
            }
        });

        // Simple table extraction from raw text
        const tableMatches =
            result.value.match(/<table[^>]*>.*?<\/table>/g) || [];
        tableMatches.forEach((tableHtml) => {
            const rows: string[][] = [];
            const rowMatches = tableHtml.match(/<tr[^>]*>.*?<\/tr>/g) || [];

            rowMatches.forEach((rowHtml) => {
                const cells: string[] = [];
                const cellMatches =
                    rowHtml.match(/<t[dh][^>]*>.*?<\/t[dh]>/g) || [];
                cellMatches.forEach((cellHtml) => {
                    cells.push(cellHtml.replace(/<[^>]+>/g, '').trim());
                });
                if (cells.length > 0) rows.push(cells);
            });

            if (rows.length > 0) {
                structure.tables.push({
                    headers: rows[0] || [],
                    rows: rows.slice(1),
                    index: elementIndex++,
                });
            }
        });

        // Extract basic metadata from document properties if available
        structure.metadata = {
            title: undefined,
            author: undefined,
            pageCount: undefined,
        };

        return structure;
    },

    modifyDocument: async (
        filePath: string | Buffer,
        modifications: DocumentModification[]
    ): Promise<Buffer> => {
        console.log('[WEB] Microsoft Docs modifyDocument');

        // First, read the document structure
        const structure = await microsoftDocs.readDocument(filePath);

        // Build a new document structure based on modifications
        const newContent: SimpleDocumentOptions['content'] = [];
        const processedIndices = new Set<number>();

        // Apply modifications
        modifications.forEach((mod) => {
            switch (mod.type) {
                case 'replaceText':
                    // Replace all occurrences of text
                    structure.paragraphs.forEach((para) => {
                        if (
                            mod.target?.text &&
                            mod.content &&
                            typeof mod.content === 'string'
                        ) {
                            para.text = para.text.replace(
                                new RegExp(mod.target.text, 'g'),
                                mod.content
                            );
                        } else if (
                            mod.target?.contains &&
                            mod.content &&
                            typeof mod.content === 'string'
                        ) {
                            if (para.text.includes(mod.target.contains)) {
                                para.text = para.text.replace(
                                    new RegExp(mod.target.contains, 'g'),
                                    mod.content
                                );
                            }
                        }
                    });
                    break;

                case 'replaceParagraph':
                    if (mod.target?.index !== undefined && mod.content) {
                        const targetPara = structure.paragraphs.find(
                            (p) => p.index === mod.target!.index
                        );
                        if (targetPara) {
                            // Mark as processed and update
                            processedIndices.add(mod.target.index);
                            const newPara =
                                typeof mod.content === 'string'
                                    ? {
                                          text: mod.content,
                                          type: 'normal' as const,
                                          index: targetPara.index,
                                      }
                                    : typeof mod.content === 'object' &&
                                      mod.content &&
                                      'text' in mod.content
                                    ? {
                                          text:
                                              typeof mod.content.text ===
                                              'string'
                                                  ? mod.content.text
                                                  : '',
                                          type: 'normal' as const,
                                          index: targetPara.index,
                                      }
                                    : {
                                          text: '',
                                          type: 'normal' as const,
                                          index: targetPara.index,
                                      };
                            const idx =
                                structure.paragraphs.indexOf(targetPara);
                            structure.paragraphs[idx] = newPara;
                        }
                    }
                    break;

                case 'deleteParagraph':
                    if (mod.target?.index !== undefined) {
                        processedIndices.add(mod.target.index);
                        structure.paragraphs = structure.paragraphs.filter(
                            (p) => p.index !== mod.target!.index
                        );
                    }
                    break;

                case 'insertParagraph':
                    if (mod.target?.index !== undefined && mod.content) {
                        // Insert at specific position
                        const insertIdx = structure.paragraphs.findIndex(
                            (p) => p.index >= mod.target!.index!
                        );
                        const newPara = {
                            text:
                                typeof mod.content === 'string'
                                    ? mod.content
                                    : typeof mod.content === 'object' &&
                                      mod.content &&
                                      'text' in mod.content
                                    ? typeof mod.content.text === 'string'
                                        ? mod.content.text
                                        : ''
                                    : '',
                            type: 'normal' as const,
                            index: mod.target.index,
                        };
                        if (insertIdx >= 0) {
                            structure.paragraphs.splice(insertIdx, 0, newPara);
                        } else {
                            structure.paragraphs.push(newPara);
                        }
                    }
                    break;

                case 'replaceTable':
                    if (mod.target?.index !== undefined && mod.content) {
                        const targetTable = structure.tables.find(
                            (t) => t.index === mod.target!.index
                        );
                        if (
                            targetTable &&
                            typeof mod.content === 'object' &&
                            mod.content &&
                            'headers' in mod.content
                        ) {
                            processedIndices.add(mod.target.index);
                            targetTable.headers =
                                mod.content.headers || targetTable.headers;
                            targetTable.rows =
                                mod.content.rows || targetTable.rows;
                        }
                    }
                    break;

                case 'appendContent':
                    if (mod.content) {
                        const maxIndex = Math.max(
                            ...structure.paragraphs.map((p) => p.index),
                            0
                        );
                        if (Array.isArray(mod.content)) {
                            mod.content.forEach((item, i) => {
                                structure.paragraphs.push({
                                    text:
                                        typeof item === 'string'
                                            ? item
                                            : typeof item === 'object' &&
                                              item &&
                                              'text' in item
                                            ? typeof item.text === 'string'
                                                ? item.text
                                                : ''
                                            : '',
                                    type: 'normal',
                                    index: maxIndex + i + 1,
                                });
                            });
                        } else {
                            structure.paragraphs.push({
                                text:
                                    typeof mod.content === 'string'
                                        ? mod.content
                                        : typeof mod.content === 'object' &&
                                          mod.content &&
                                          'text' in mod.content
                                        ? typeof mod.content.text === 'string'
                                            ? mod.content.text
                                            : ''
                                        : '',
                                type: 'normal',
                                index: maxIndex + 1,
                            });
                        }
                    }
                    break;

                case 'prependContent':
                    if (mod.content) {
                        // Shift all indices and prepend
                        structure.paragraphs.forEach((p) => (p.index += 1));
                        structure.tables.forEach((t) => (t.index += 1));

                        if (Array.isArray(mod.content)) {
                            mod.content.reverse().forEach((item) => {
                                structure.paragraphs.unshift({
                                    text:
                                        typeof item === 'string'
                                            ? item
                                            : typeof item === 'object' &&
                                              item &&
                                              'text' in item
                                            ? typeof item.text === 'string'
                                                ? item.text
                                                : ''
                                            : '',
                                    type: 'normal',
                                    index: 0,
                                });
                            });
                        } else {
                            structure.paragraphs.unshift({
                                text:
                                    typeof mod.content === 'string'
                                        ? mod.content
                                        : typeof mod.content === 'object' &&
                                          mod.content &&
                                          'text' in mod.content
                                        ? typeof mod.content.text === 'string'
                                            ? mod.content.text
                                            : ''
                                        : '',
                                type: 'normal',
                                index: 0,
                            });
                        }
                    }
                    break;
            }
        });

        // Combine all elements in order by index
        const allElements: (
            | (DocumentStructure['paragraphs'][0] & {
                  elementType: 'paragraph';
              })
            | (DocumentStructure['tables'][0] & { elementType: 'table' })
        )[] = [
            ...structure.paragraphs.map((p) => ({
                ...p,
                elementType: 'paragraph' as const,
            })),
            ...structure.tables.map((t) => ({
                ...t,
                elementType: 'table' as const,
            })),
        ].sort((a, b) => a.index - b.index);

        // Build the new content array
        allElements.forEach((element) => {
            if (element.elementType === 'paragraph') {
                newContent.push(convertParagraphToContent(element));
            } else if (element.elementType === 'table') {
                newContent.push({
                    table: {
                        headers: element.headers,
                        rows: element.rows,
                    },
                });
            }
        });

        // Apply metadata modifications if any
        const documentOptions: SimpleDocumentOptions = {
            content: newContent,
        };

        const metadataMod = modifications.find(
            (m) => m.type === 'updateMetadata'
        );
        if (metadataMod?.metadata) {
            documentOptions.title = metadataMod.metadata.title;
            documentOptions.creator = metadataMod.metadata.creator;
        }

        // Generate the new document
        return await microsoftDocs.generateDocument(documentOptions);
    },

    downloadDocument: async (
        buffer: Buffer,
        options: DownloadDocumentOptions
    ): Promise<boolean> => {
        console.log('[WEB] Microsoft Docs downloadDocument');

        try {
            // Create a blob from the buffer - convert Buffer to Uint8Array for compatibility
            const blob = new Blob([new Uint8Array(buffer)], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            // Create a download URL
            const url = URL.createObjectURL(blob);

            if (options.openInNewTab) {
                // Open in new tab
                window.open(url, '_blank');
                // Clean up after a delay
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            } else {
                // Create a temporary anchor element for download
                const a = document.createElement('a');
                a.href = url;
                a.download = options.filename;
                a.style.display = 'none';

                // Add to document, click, and remove
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Clean up the blob URL after a short delay
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }

            return true;
        } catch (error) {
            console.error('Failed to download document:', error);
            return false;
        }
    },
};
