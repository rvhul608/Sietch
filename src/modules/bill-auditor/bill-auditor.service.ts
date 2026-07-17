import { Injectable } from "@nitrostack/core";
import {
  AuditBillInputSchema,
  AuditBillOutputSchema,
} from "../../shared/schemas.js";

@Injectable()
export class BillAuditorService {
  async auditBill(
    input: typeof AuditBillInputSchema._type
  ): Promise<typeof AuditBillOutputSchema._type> {

    return {
      totalBill: 85000,
      estimatedInsuranceCoverage: 65000,
      estimatedOutOfPocket: 20000,

      coveredItems: [
        {
          item: "Room Rent",
          amount: 30000,
          covered: true,
          reason: "Covered under hospitalization benefit"
        },
        {
          item: "Doctor Consultation",
          amount: 10000,
          covered: true,
          reason: "Covered under policy"
        }
      ],

      nonCoveredItems: [
        {
          item: "Gloves",
          amount: 2000,
          covered: false,
          reason: "Consumables are excluded"
        }
      ],

      possibleOvercharges: [
        {
          item: "MRI Scan",
          amount: 25000,
          covered: true,
          reason: "Higher than typical market price"
        }
      ],

      summary:
        "Insurance is estimated to pay ₹65,000. Consumables are excluded. MRI cost appears unusually high."
    };
  }
}