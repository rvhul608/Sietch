import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { CoverageModule } from './modules/coverage/coverage.module.js';
/**
 * Policy Red-Flag & Coverage Agent.
  Reads a user's insurance policy and gives concrete numeric answers
  about coverage, red flags, and next steps.
 */
@McpApp({
    module: AppModule,
    server: {
        name: 'pizzaz-finder',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'pizzaz',
    description: 'Pizza shop finder with interactive maps',
    imports: [
        ConfigModule.forRoot(),
        CoverageModule
    ],
})
export class AppModule { }
