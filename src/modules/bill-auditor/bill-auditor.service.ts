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

interface ExtractedBill {
  hospitalName: string;
  treatment: string;
  totalBillAmount: number;
  billItems: Array<{ item: string; amount: number }>;
}

@Injectable()
export class BillAuditorService {
  /**
   * Uses Groq's vision model to extract structured bill data from a
   * base64-encoded image or PDF of a hospital bill.
   */
  private async extractBillFromImage(
    fileContent: string,
    fileType: string
  ): Promise<ExtractedBill> {
    const baseUrl = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not set — cannot extract bill data from an uploaded file."
      );
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: [
                  "Extract structured data from this hospital bill.",
                  "Respond ONLY with a JSON object in exactly this shape:",
                  '{"hospitalName": string, "treatment": string, "totalBillAmount": number, "billItems": [{"item": string, "amount": number}]}',
                  "Amounts are numbers in rupees (no currency symbols, no commas).",
                  "Include every distinct line item you can read from the bill.",
                ].join(" "),
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${fileType};base64,${fileContent}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq vision extraction failed (${res.status}): ${errText}`);
    }

    const data = await (res.json()) as any;
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error("Groq vision extraction returned no content.");
    }

    let parsed: ExtractedBill;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        `Groq vision extraction returned invalid JSON: ${raw.slice(0, 200)}`
      );
    }

    if (!Array.isArray(parsed.billItems)) {
      throw new Error("Extracted bill data is missing billItems.");
    }

    return parsed;
  }

  async auditBill(
    input: typeof AuditBillInputSchema._type
  ): Promise<typeof AuditBillOutputSchema._type> {
    let { billItems, totalBillAmount } = input;

    // If no structured billItems were provided but a file was, extract
    // the structured data from the file first.
    if ((!billItems || billItems.length === 0) && input.file_content) {
      const extracted = await this.extractBillFromImage(
        input.file_content,
        input.file_type ?? "image/jpeg"
      );
      billItems = extracted.billItems;
      totalBillAmount = totalBillAmount ?? extracted.totalBillAmount;
    }

    if (!billItems || billItems.length === 0) {
      throw new Error(
        "No bill items available — provide billItems directly or a file_content to extract from."
      );
    }
    if (totalBillAmount === undefined) {
      throw new Error("totalBillAmount is required (or must be extractable from the uploaded file).");
    }

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