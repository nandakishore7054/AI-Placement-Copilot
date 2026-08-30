import { extractText, getDocumentProxy } from "unpdf";

export interface PdfParseResult {
  text: string;
  numPages: number;
  info?: Record<string, unknown>;
}

/**
 * Extracts plain text from a PDF Buffer or Uint8Array.
 * Uses `unpdf` (serverless-compatible, zero-worker PDF parser designed for Next.js / Turbopack).
 * Handles corrupted PDFs, password protection, and binary header checks.
 */
export async function extractTextFromPdf(buffer: Buffer | Uint8Array): Promise<PdfParseResult> {
  if (!buffer || buffer.byteLength < 4) {
    throw new Error("File is too small to be a valid PDF.");
  }

  // Ensure isolated Uint8Array starting at offset 0
  const uint8Data =
    buffer instanceof Uint8Array
      ? new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
      : new Uint8Array(buffer);

  // Validate PDF magic bytes header: %PDF (0x25, 0x50, 0x44, 0x46)
  if (
    uint8Data[0] !== 0x25 ||
    uint8Data[1] !== 0x50 ||
    uint8Data[2] !== 0x44 ||
    uint8Data[3] !== 0x46
  ) {
    throw new Error("Invalid file format: Document does not have a valid PDF header (%PDF).");
  }

  try {
    const { text, totalPages } = await extractText(uint8Data, { mergePages: true });
    const cleanText = (text || "").replace(/\r\n/g, "\n").trim();

    return {
      text: cleanText,
      numPages: totalPages || 1,
    };
  } catch (error) {
    console.error("[extractTextFromPdf] Error parsing PDF:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.toLowerCase().includes("password") ||
      errorMessage.toLowerCase().includes("encrypted")
    ) {
      throw new Error("PDF is password-protected. Please upload an unprotected PDF.");
    }

    throw new Error(`Failed to parse PDF document: ${errorMessage || "The file may be damaged or invalid."}`);
  }
}
