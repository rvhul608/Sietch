import { Module } from "@nitrostack/core";
import { BillAuditorTools } from "./bill-auditor.tools.js";
import { BillAuditorService } from "./bill-auditor.service.js";

@Module({
  name: "bill-auditor",
  description: "Hospital bill auditing module",

  providers: [
    BillAuditorService
  ],

  controllers: [
    BillAuditorTools
  ],
})
export class BillAuditorModule {}