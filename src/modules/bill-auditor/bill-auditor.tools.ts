import {
  ToolDecorator as Tool,
  Injectable,
  ExecutionContext,
} from "@nitrostack/core";

import { BillAuditorService } from "./bill-auditor.service.js";
import { AuditBillInputSchema } from "../../shared/schemas.js";

@Injectable({deps:[BillAuditorService]})
export class BillAuditorTools {
  constructor(
    private readonly billAuditorService: BillAuditorService
  ) {}

  @Tool({
    name: "audit_bill",
    description: "Audit a hospital bill and estimate insurance coverage.",
    inputSchema: AuditBillInputSchema,
  })
  async auditBill(
    args: typeof AuditBillInputSchema._type
  ) {
    return this.billAuditorService.auditBill(args);
  }
}