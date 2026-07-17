import {
    Injectable,
    ToolDecorator as Tool,
    ExecutionContext,
    z,
} from "@nitrostack/core";

import {
    HospitalLookupService,
} from "./hospital-lookup.service.js";

const InputSchema = z.object({
    insurer: z.string().describe("Insurance company name"),
    city: z
        .string()
        .optional()
        .describe("City name (optional)")
});

const OutputSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        phone: z.string().optional(),
        cashless: z.boolean(),
        insuranceProviders: z.array(z.string()),
        lat: z.number().optional(),
        lng: z.number().optional(),
    })
);

@Injectable({
    deps: [HospitalLookupService],
})
export class HospitalLookupTools {
    constructor(
        private readonly hospitalService: HospitalLookupService
    ) { }

    @Tool({
        name: "find_network_hospitals",
        description:
            "Returns all cashless hospitals available for an insurance provider. Optionally filter by city.",

        inputSchema: InputSchema,

        outputSchema: OutputSchema,

        examples: {
            request: {
                insurer: "Star Health",
                city: "Bengaluru",
            },

            response: [
                {
                    id: "hosp_001",
                    name: "Apollo Hospital",
                    address: "Bannerghatta Road",
                    city: "Bengaluru",
                    state: "Karnataka",
                    cashless: true,
                    insuranceProviders: [
                        "Star Health",
                        "Niva Bupa"
                    ]
                }
            ]
        },
    })
    async findHospitals(
        input: z.infer<typeof InputSchema>,
        ctx: ExecutionContext
    ) {
        ctx.logger.info("Searching hospitals", input);

        return this.hospitalService.findHospitals(input);
    }
}