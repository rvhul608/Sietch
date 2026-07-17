import { Module } from "@nitrostack/core";

import { PolicyAnalysisTools } from "./policy-analysis.tools.js";
import { PolicyAnalysisService } from "./policy-analysis.service.js";
import { PdfService } from "./pdf.service.js";
import { GroqService } from "./groq.service.js";

@Module({
  name: "policy-analysis",

  controllers: [PolicyAnalysisTools],

  providers: [
    PdfService,
    GroqService,
    PolicyAnalysisService,
    PolicyAnalysisTools,
  ],

  exports: [PolicyAnalysisService],
})
export class PolicyAnalysisModule {
  constructor() {
    console.log("✅ PolicyAnalysisModule loaded");
  }
}