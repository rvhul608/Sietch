import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

export class PdfService {
    async extractText(filePath: string): Promise<string> {
        try {
            const buffer = fs.readFileSync(filePath);
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            console.error("Error reading PDF:", error);
            throw error;
        }
    }
}