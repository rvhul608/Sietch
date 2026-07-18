import { z } from '@nitrostack/core';

/* ============================================================
   SHARED PRIMITIVES — reused across tools
   ============================================================ */

export const WaitingPeriodTierSchema = z.enum([
  'initial',          // e.g. first 30 days, everything excluded
  'disease_specific',  // e.g. 2 years for named conditions
  'pre_existing',      // e.g. 3-4 years for pre-existing conditions
]);

export const SeveritySchema = z.enum(['high', 'medium', 'low']);

/* ============================================================
   TOOL 1 — analyze-policy   (owner: Teammate A)
   ============================================================ */

export const RedFlagSchema = z.object({
  id: z.string().describe('Unique id for this flag, e.g. "flag_001"'),
  type: z.enum(['exclusion', 'sub_limit', 'waiting_period', 'co_pay', 'other']),
  clauseText: z.string().describe('Original policy wording, verbatim'),
  plainLanguage: z.string().describe('Plain-language explanation of what this means for the user'),
  severity: SeveritySchema,
});

export const GlossaryEntrySchema = z.object({
  term: z.string(),
  definition: z.string(),
});

export const AnalyzePolicyInputSchema = z.object({
  policyId: z.string().describe('A label for this policy analysis session'),
  file_name: z.string().describe('Original filename, e.g. "policy.pdf"'),
  file_type: z.string().describe('MIME type, e.g. "application/pdf"'),
  file_content: z.string().describe('Base64-encoded file content'),
});

export const AnalyzePolicyOutputSchema = z.object({
  policyId: z.string(),
  insurerName: z.string(),
  redFlags: z.array(RedFlagSchema),
  glossary: z.array(GlossaryEntrySchema),
});

/* ============================================================
   TOOL 2 — check-coverage   (owner: You / Lead)
   ============================================================ */

export const CheckCoverageInputSchema = z.object({
  policyId: z.string(),
  diagnosis: z.string().describe('Diagnosis or procedure name to check coverage for'),
  policyStartDate: z.string().describe('ISO date the policy began, used for waiting-period calc'),
  claimAmountInRupees: z.number().describe('Amount being claimed, in rupees'),
});

export const CheckCoverageOutputSchema = z.object({
  policyId: z.string(),
  diagnosis: z.string(),
  isCovered: z.boolean(),
  waitingPeriodStatus: z.object({
    tier: WaitingPeriodTierSchema,
    isServed: z.boolean().describe('Whether the waiting period has already been served'),
    daysRemaining: z.number().nullable(),
  }),
  subLimitAppliedInRupees: z.number().nullable(),
  coPayPercentage: z.number().nullable(),
  finalPayoutInRupees: z.number().describe('The actual number the user would receive'),
  explanation: z.string().describe('Plain-language walkthrough of how the payout was calculated'),
});

/* ============================================================
   TOOL 3 — find-network-hospital   (owner: Teammate B)
   ============================================================ */

export const FindNetworkHospitalInputSchema = z.object({
  policyId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number().optional().describe('Search radius in kilometers, default 10'),
});

export const HospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  coords: z.tuple([z.number(), z.number()]).describe('[longitude, latitude]'),
  distanceKm: z.number(),
  isCashless: z.boolean().describe('Whether cashless treatment is available under this policy'),
  phone: z.string().optional(),
});

export const FindNetworkHospitalOutputSchema = z.object({
  policyId: z.string(),
  hospitals: z.array(HospitalSchema),
  totalFound: z.number(),
});

/* ============================================================
   STRETCH — complaint-letter-generator (owner: Teammate C)
   Depends on AnalyzePolicyOutputSchema.redFlags
   ============================================================ */

/* ============================================================
   TOOL 4 — audit-bill   (owner: You)
   ============================================================ */

export const AuditBillInputSchema = z.object({
  policyId: z.string().describe('Insurance policy identifier'),
  hospitalName: z.string().optional().describe('Hospital where treatment happened'),
  totalBillAmount: z.number().optional().describe('Total hospital bill amount in rupees'),
  treatment: z.string().optional().describe('Treatment/procedure name'),
  billItems: z.array(
    z.object({ item: z.string(), amount: z.number() })
  ).optional().describe('Individual bill items'),
  file_name: z.string().optional(),
  file_type: z.string().optional(),
  file_content: z.string().optional().describe('Base64-encoded bill image or PDF'),
}).refine(
  (data) => data.billItems?.length || data.file_content,
  { message: 'Either billItems or file_content must be provided' }
);

export const AuditBillOutputSchema = z.object({
  totalBill: z.number(),

  estimatedInsuranceCoverage: z.number()
    .describe('Estimated amount covered by insurance'),

  estimatedOutOfPocket: z.number()
    .describe('Estimated amount user has to pay'),

  coveredItems: z.array(
    z.object({
      item: z.string(),
      amount: z.number(),
      covered: z.boolean(),
      reason: z.string(),
    })
  ),

  nonCoveredItems: z.array(
    z.object({
      item: z.string(),
      amount: z.number(),
      covered: z.boolean(),
      reason: z.string(),
    })
  ),

  possibleOvercharges: z.array(
    z.object({
      item: z.string(),
      amount: z.number(),
      covered: z.boolean(),
      reason: z.string(),
    })
  ),

  summary: z.string()
    .describe('Plain-language explanation of bill audit result'),
});
