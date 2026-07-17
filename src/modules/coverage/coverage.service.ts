/**
 * coverage.service.ts
 *
 * Pure business logic, no decorators, no MCP-specific types — easy to
 * unit test and easy for teammates to call directly if they need coverage
 * numbers inside their own service (e.g. complaint-generator citing the
 * sub-limit that got applied).
 *
 * STATELESS: every value needed is passed in as an argument. Nothing is
 * read from a previous call, a session, or a database — per the "no
 * persistent storage yet" constraint.
 */

import { COVERAGE_RULES, DEFAULT_COVERAGE_RULE, CoverageRule } from './coverage.data.js';
// TODO: import { CoverageCheckInput, CoverageCheckOutput } from '../../shared/schemas';
//       once these are added to the locked contract — see note at bottom of coverage.tools.ts.
//       Using local types for now so this compiles standalone.

export interface CoverageCheckInput {
  policyId: string;
  diagnosis: string;
  claimAmountInRupees: number;
  policyStartDate: string; // ISO date, e.g. "2023-01-15"
}

export interface CoverageCheckOutput {
  policyId: string;
  diagnosis: string;
  isCovered: boolean;
  waitingPeriodStatus: {
    tier: 'initial' | 'disease_specific' | 'pre_existing';
    isServed: boolean;
    daysRemaining: number | null;
  };
  subLimitAppliedInRupees: number | null;
  coPayPercentage: number;
  finalPayoutInRupees: number;
  explanation: string;
}

export class CoverageService {
  checkCoverage(input: CoverageCheckInput): CoverageCheckOutput {
    const rule = this.findRule(input.diagnosis);
    const elapsedDays = this.daysBetween(input.policyStartDate, new Date());
    const isServed = elapsedDays >= rule.waitingPeriodDays;
    const daysRemaining = isServed ? null : rule.waitingPeriodDays - elapsedDays;

    const isCovered = isServed;
    const subLimitApplied = rule.subLimitInRupees;

    const finalPayout = isCovered
      ? this.computePayout(input.claimAmountInRupees, subLimitApplied, rule.coPayPercentage)
      : 0;

    return {
      policyId: input.policyId,
      diagnosis: input.diagnosis,
      isCovered,
      waitingPeriodStatus: {
        tier: rule.tier,
        isServed,
        daysRemaining,
      },
      subLimitAppliedInRupees: subLimitApplied,
      coPayPercentage: rule.coPayPercentage,
      finalPayoutInRupees: finalPayout,
      explanation: this.buildExplanation(input, rule, isServed, daysRemaining, subLimitApplied, finalPayout),
    };
  }

  private findRule(diagnosis: string): CoverageRule {
    const normalized = diagnosis.toLowerCase();
    const match = COVERAGE_RULES.find((rule) =>
      rule.diagnosisKeywords.some((keyword) => normalized.includes(keyword)),
    );
    return match ?? DEFAULT_COVERAGE_RULE;
  }

  private daysBetween(isoStart: string, end: Date): number {
    const start = new Date(isoStart);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((end.getTime() - start.getTime()) / msPerDay);
  }

  private computePayout(
    claimAmountInRupees: number,
    subLimitInRupees: number | null,
    coPayPercentage: number,
  ): number {
    const capped =
      subLimitInRupees !== null ? Math.min(claimAmountInRupees, subLimitInRupees) : claimAmountInRupees;
    const afterCoPay = capped * (1 - coPayPercentage / 100);
    return Math.round(afterCoPay);
  }

  private buildExplanation(
    input: CoverageCheckInput,
    rule: CoverageRule,
    isServed: boolean,
    daysRemaining: number | null,
    subLimitApplied: number | null,
    finalPayout: number,
  ): string {
    if (!isServed) {
      return `Waiting period not yet cleared for this ${rule.tier.replace('_', ' ')} condition — ${daysRemaining} day(s) remaining before this claim would be payable.`;
    }

    if (subLimitApplied !== null && input.claimAmountInRupees > subLimitApplied) {
      const outOfPocket = input.claimAmountInRupees - subLimitApplied;
      return `Waiting period cleared. Sub-limit of ₹${subLimitApplied.toLocaleString('en-IN')} applies — your claim of ₹${input.claimAmountInRupees.toLocaleString('en-IN')} is capped, so you'll receive ₹${finalPayout.toLocaleString('en-IN')} and pay the remaining ₹${outOfPocket.toLocaleString('en-IN')} yourself.`;
    }

    if (rule.coPayPercentage > 0) {
      return `Waiting period cleared, no sub-limit applies, but a ${rule.coPayPercentage}% co-pay reduces your payout to ₹${finalPayout.toLocaleString('en-IN')}.`;
    }

    return `Waiting period cleared, fully covered — you'll receive ₹${finalPayout.toLocaleString('en-IN')}.`;
  }
}