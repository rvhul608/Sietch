/**
 * coverage.data.ts
 *
 * Two different things live here, don't conflate them:
 *
 * 1. SHARED_DEMO_SCENARIO — the one input everyone on the team agreed to
 *    build/test against tonight. This is NOT policy data our module owns;
 *    it's just the fixture we all point our tools at so outputs reconcile
 *    at integration time. Policy-analysis owns the real "parse a policy"
 *    logic — we only consume policyId/diagnosis/claimAmountInRupees/
 *    policyStartDate as tool input.
 *
 * 2. COVERAGE_RULES — our own domain lookup table (mock IRDAI-style rules)
 *    that maps a diagnosis to its waiting-period tier, sub-limit, and
 *    co-pay. This is what CoverageService actually computes against.
 *    Swap this for a real dataset later without touching service logic.
 */

export const SHARED_DEMO_SCENARIO = {
  policyId: 'demo-policy-001',
  insurerName: 'Sample Health Insurer',
  diagnosis: 'cataract surgery',
  claimAmountInRupees: 55000,
  policyStartDate: '2023-01-15',
  userName: 'Rahul Verma',
  location: { latitude: 8.5241, longitude: 76.9366 }, // Thiruvananthapuram
} as const;

export type WaitingPeriodTier = 'initial' | 'disease_specific' | 'pre_existing';

export interface CoverageRule {
  /** Matched against the incoming `diagnosis` string, case-insensitive substring match for the demo. */
  diagnosisKeywords: string[];
  tier: WaitingPeriodTier;
  /** How many days from policy start before this tier is considered "served". */
  waitingPeriodDays: number;
  /** Per-claim sub-limit in rupees. `null` means no sub-limit (full sum insured applies). */
  subLimitInRupees: number | null;
  coPayPercentage: number;
}

/**
 * MOCK rule table — plausible numbers for demo purposes, not sourced from a
 * real policy wording. Swap for real extracted policy terms once
 * policy-analysis's output is available.
 */
export const COVERAGE_RULES: CoverageRule[] = [
  {
    diagnosisKeywords: ['cataract'],
    tier: 'disease_specific',
    waitingPeriodDays: 730, // 2 years, typical for cataract in Indian health policies
    subLimitInRupees: 40000, // per eye
    coPayPercentage: 0,
  },
  {
    diagnosisKeywords: ['knee replacement', 'joint replacement', 'hip replacement'],
    tier: 'disease_specific',
    waitingPeriodDays: 730,
    subLimitInRupees: 100000,
    coPayPercentage: 10,
  },
  {
    diagnosisKeywords: ['diabetes', 'hypertension', 'thyroid'],
    tier: 'pre_existing',
    waitingPeriodDays: 1460, // 4 years
    subLimitInRupees: null,
    coPayPercentage: 20,
  },
];

/** Fallback rule for anything not in the table — no sub-limit, standard 30-day initial waiting period. */
export const DEFAULT_COVERAGE_RULE: CoverageRule = {
  diagnosisKeywords: [],
  tier: 'initial',
  waitingPeriodDays: 30,
  subLimitInRupees: null,
  coPayPercentage: 0,
};