import { Module } from '@nitrostack/core';
import { InsuranceReferenceResources } from './insurance-reference.resources.js';
import { InsuranceReferencePrompts } from './insurance-reference.prompts.js';

@Module({
  name: 'insurance-reference',
  controllers: [InsuranceReferenceResources, InsuranceReferencePrompts],
  providers: [InsuranceReferenceResources, InsuranceReferencePrompts],
})
export class InsuranceReferenceModule {}
