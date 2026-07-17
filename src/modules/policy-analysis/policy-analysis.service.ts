import { PdfService } from "./pdf.service.js";
import { GroqService } from "./groq.service.js";

import {
    AnalyzePolicyInputSchema,
    AnalyzePolicyOutputSchema
} from "../../shared/schemas.js";

import { z } from "@nitrostack/core";

export class PolicyAnalysisService {

    private pdfService = new PdfService();

    private groqService = new GroqService();

    async analyzePolicy(
        input: z.infer<typeof AnalyzePolicyInputSchema>
    ) {

        // Step 1: Extract text from uploaded Base64 PDF
        const policyText =
            await this.pdfService.extractText(input.file_content);

        // Step 2: Send text to Groq
        const groqResponse =
            await this.groqService.analyzePolicy(policyText);

        // Step 3: Parse JSON
        const parsed = JSON.parse(groqResponse);

        // Step 4: Validate output
        const validated =
            AnalyzePolicyOutputSchema.parse(parsed);

        return validated;
    }
}