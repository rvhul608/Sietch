import {
  ToolDecorator as Tool,
  Injectable,
  z,
  ExecutionContext,
} from "@nitrostack/core";

import { PolicyAnalysisService } from "./policy-analysis.service.js";

import {
  AnalyzePolicyInputSchema,
  AnalyzePolicyOutputSchema,
} from "../../shared/schemas.js";

@Injectable({
  deps: [PolicyAnalysisService],
})
export class PolicyAnalysisTools {
  constructor(
    private readonly policyAnalysisService: PolicyAnalysisService
  ) {}

  @Tool({
    name: "analyze_policy",
    description:
      "Analyzes an insurance policy and returns insurer information, important red flags, and a glossary explaining technical insurance terms.",
    inputSchema: AnalyzePolicyInputSchema,
    outputSchema: AnalyzePolicyOutputSchema,

examples: {
  request: {
    policyId: "demo-policy-001",
    file_name: "policy.pdf",
    file_type: "application/pdf",
    file_content: "JVBERi0xLjQK...", // placeholder
  },

  response: {
    policyId: "demo-policy-001",
    insurerName: "HDFC ERGO",
    redFlags: [],
    glossary: [],
  },
},
  })
  async analyzePolicy(
    input: z.infer<typeof AnalyzePolicyInputSchema>,
    ctx: ExecutionContext
  ): Promise<z.infer<typeof AnalyzePolicyOutputSchema>> {

    ctx.logger.info("Analyzing policy", {
      policyId: input.policyId,
    });

    return this.policyAnalysisService.analyzePolicy(input);
  }
  
}