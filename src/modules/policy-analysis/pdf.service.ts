import pdf from "pdf-parse/lib/pdf-parse.js";

export class PdfService {
  async extractText(fileContentBase64: string): Promise<string> {
    try {
      const buffer = Buffer.from(fileContentBase64, "base64");
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error("Error reading PDF:", error);
      throw error;
    }
  }
}