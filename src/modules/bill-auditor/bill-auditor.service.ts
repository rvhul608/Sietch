import { Injectable } from "@nitrostack/core";
import {
  AuditBillInputSchema,
  AuditBillOutputSchema,
} from "../../shared/schemas.js";

const EXCLUDED_KEYWORDS = [
  "glove",
  "syringe",
  "mask",
  "cap",
  "shoe cover",
  "cotton",
  "bandage",
  "disposable",
  "toiletries",
  "registration fee",
  "admin",
  "courier",
  "attendant",
  "food",
  "telephone",
  "wifi",
  "television",
];

function isExcludedItem(itemName: string): boolean {
  const lower = itemName.toLowerCase();
  return EXCLUDED_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

@Injectable()
export class BillAuditorService {
  async auditBill(
    input: typeof AuditBillInputSchema._type
  ): Promise<typeof AuditBillOutputSchema._type> {
    const { billItems, totalBillAmount } = input;

    const coveredItems: Array<{
      item: string;
      amount: number;
      covered: boolean;
      reason: string;
    }> = [];

    const nonCoveredItems: typeof coveredItems = [];

    for (const billItem of billItems) {
      if (isExcludedItem(billItem.item)) {
        nonCoveredItems.push({
          item: billItem.item,
          amount: billItem.amount,
          covered: false,
          reason: "Consumable or administrative item, typically excluded under standard policy terms",
        });
      } else {
        coveredItems.push({
          item: billItem.item,
          amount: billItem.amount,
          covered: true,
          reason: "Standard treatment-related expense, covered under policy",
        });
      }
    }

    const coveredAmounts = coveredItems.map((i) => i.amount);
    const medianAmount = median(coveredAmounts);
    const overchargeThreshold = medianAmount * 1.75;

    const possibleOvercharges = coveredItems
      .filter((i) => medianAmount > 0 && i.amount > overchargeThreshold)
      .map((i) => ({
        item: i.item,
        amount: i.amount,
        covered: true,
        reason: `Amount is significantly higher than the median line item (₹${medianAmount.toFixed(
          0
        )}) on this bill — worth requesting an itemized breakdown or comparing against typical market rates`,
      }));

    const estimatedInsuranceCoverage = coveredItems.reduce(
      (sum, i) => sum + i.amount,
      0
    );
    const totalBill = totalBillAmount;
    const estimatedOutOfPocket = Math.max(totalBill - estimatedInsuranceCoverage, 0);

    const summaryParts: string[] = [];
    summaryParts.push(
      `Insurance is estimated to cover ₹${estimatedInsuranceCoverage.toLocaleString(
        "en-IN"
      )} of the ₹${totalBill.toLocaleString("en-IN")} total bill.`
    );
    if (nonCoveredItems.length > 0) {
      summaryParts.push(
        `${nonCoveredItems.length} item${
          nonCoveredItems.length !== 1 ? "s" : ""
        } excluded (${nonCoveredItems.map((i) => i.item).join(", ")}).`
      );
    }
    if (possibleOvercharges.length > 0) {
      summaryParts.push(
        `${possibleOvercharges.length} item${
          possibleOvercharges.length !== 1 ? "s" : ""
        } flagged as possibly overcharged (${possibleOvercharges
          .map((i) => i.item)
          .join(", ")}).`
      );
    }

    return {
      totalBill,
      estimatedInsuranceCoverage,
      estimatedOutOfPocket,
      coveredItems,
      nonCoveredItems,
      possibleOvercharges,
      summary: summaryParts.join(" "),
    };
  }
}
