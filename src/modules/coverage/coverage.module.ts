import { Module } from '@nitrostack/core';
import { CoverageService } from './coverage.service.js';
import { CoverageTools } from './coverage.tools.js';

@Module({
  name: 'coverage',
  controllers : [CoverageTools],
  providers: [CoverageService, CoverageTools],
  exports: [CoverageService],
})
export class CoverageModule {}