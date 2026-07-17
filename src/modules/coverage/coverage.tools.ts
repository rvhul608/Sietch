import { ToolDecorator as Tool, Injectable, z, ExecutionContext } from '@nitrostack/core';

import { CoverageService, CoverageCheckOutput } from './coverage.service';

const CoverageCheckInputSchema = z.object({
  policyId: z.string().describe('Policy identifier'),
  diagnosis: z.string().describe('Diagnosis or procedure being claimed, e.g. "cataract surgery"'),
  claimAmountInRupees: z.number().positive().describe('Amount being claimed, in rupees'),
  policyStartDate: z.string().describe('ISO date the policy started, e.g. "2023-01-15"'),
});

const CoverageCheckOutputSchema = z.object({
  policyId: z.string(),
  diagnosis: z.string(),
  isCovered: z.boolean(),
  waitingPeriodStatus: z.object({
    tier: z.enum(['initial', 'disease_specific', 'pre_existing']),
    isServed: z.boolean(),
    daysRemaining: z.number().nullable(),
  }),
  subLimitAppliedInRupees: z.number().nullable(),
  coPayPercentage: z.number(),
  finalPayoutInRupees: z.number(),
  explanation: z.string(),
});
@Injectable({deps:[CoverageService]})
export class CoverageTools {
  constructor(private readonly coverageService: CoverageService) {}

  @Tool({
    name: 'check_coverage',
    description:
      'Given a policy, a diagnosis/procedure, and a claim amount, returns whether the claim is covered right now, ' +
      'the waiting-period status, any sub-limit applied, co-pay percentage, and the final numeric payout.',
    inputSchema: CoverageCheckInputSchema,
    outputSchema: CoverageCheckOutputSchema,
    examples: {
      request: {
        policyId: 'demo-policy-001',
        diagnosis: 'cataract surgery',
        claimAmountInRupees: 55000,
        policyStartDate: '2023-01-15',
      },
      response: {
        policyId: 'demo-policy-001',
        diagnosis: 'cataract surgery',
        isCovered: true,
        waitingPeriodStatus: {
          tier: 'disease_specific',
          isServed: true,
          daysRemaining: null,
        },
        subLimitAppliedInRupees: 40000,
        coPayPercentage: 0,
        finalPayoutInRupees: 40000,
        explanation:
          "Waiting period cleared. Sub-limit of ₹40,000 applies per eye — your claim of ₹55,000 is capped, so you'll receive ₹40,000 and pay the remaining ₹15,000 yourself.",
      },
    },
  })
  async checkCoverage(
    input: z.infer<typeof CoverageCheckInputSchema>,
    ctx: ExecutionContext,
  ): Promise<CoverageCheckOutput> {
    ctx.logger.info('Checking coverage', { policyId: input.policyId, diagnosis: input.diagnosis });
    return this.coverageService.checkCoverage(input);
  }
}