import { McpApp, Module, ConfigModule } from '@nitrostack/core';

import { CoverageModule } from './modules/coverage/coverage.module.js';
import { BillAuditorModule } from './modules/bill-auditor/bill-auditor.module.js';

/**
 * Root Application Module
 *
 * Policy Red-Flag & Coverage Agent.
 * Reads a user's insurance policy and gives concrete numeric answers
 * about coverage, red flags, and next steps.
 */
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
        BillAuditorModule
    ],
})
export class AppModule { }