import { Module } from "@nitrostack/core";

import { HospitalLookupService } from "./hospital-lookup.service.js";
import { HospitalLookupTools } from "./hospital-lookup.tools.js";

@Module({
    name: "hospital-lookup",
    controllers: [HospitalLookupTools],
    providers: [HospitalLookupService, HospitalLookupTools],
    exports: [HospitalLookupService],
})
export class HospitalLookupModule { }