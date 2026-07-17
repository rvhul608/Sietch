import { McpApp, Module, ConfigModule } from '@nitrostack/core';

import { CoverageModule } from './modules/coverage/coverage.module.js';
import { BillAuditorModule } from './modules/bill-auditor/bill-auditor.module.js';
import { PolicyAnalysisModule } from './modules/policy-analysis/policy-analysis.module.js';
import { HospitalLookupModule } from './modules/hospital-lookup/hospital-lookup.module.js';
import { InsuranceReferenceModule } from './modules/insurance-reference/insurance-reference.module.js';
@McpApp({
    module: AppModule,
    server: {
        name: 'sietch',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'sietch',
    description: 'Policy Red-Flag & Coverage Agent — insurance coverage, red flags, and next steps',
    imports: [
        ConfigModule.forRoot(),
        CoverageModule,
        BillAuditorModule,
        PolicyAnalysisModule,
        HospitalLookupModule,
        InsuranceReferenceModule
    ],
})
export class AppModule { }