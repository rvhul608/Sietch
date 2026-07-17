import { Module } from "@nitrostack/core";

import { HospitalLookupService } from "./hospital-lookup.service";
import { HospitalLookupTools } from "./hospital-lookup.tools";

@Module({
    name: "hospital-lookup",
    controllers: [HospitalLookupTools],
    providers: [HospitalLookupService, HospitalLookupTools],
    exports: [HospitalLookupService],
})
export class HospitalLookupModule { }