import { Module } from '@nitrostack/core';
import { CoverageService } from './coverage.service';
import { CoverageTools } from './coverage.tools';

@Module({
  name: 'coverage',
  controllers : [CoverageTools],
  providers: [CoverageService, CoverageTools],
  exports: [CoverageService],
})
export class CoverageModule {}