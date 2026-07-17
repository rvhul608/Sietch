import { ResourceDecorator as Resource, Injectable, ExecutionContext } from '@nitrostack/core';
import { INSURANCE_GLOSSARY } from './insurance-reference.data.js';

type ResourceContent =
  | { type: 'text'; data: string }
  | { type: 'binary'; data: Buffer }
  | { type: 'json'; data: unknown };
@Injectable({ deps: [] })
export class InsuranceReferenceResources {
  @Resource({
    uri: 'insurance://glossary',
    name: 'Insurance Glossary',
    description: 'Plain-language definitions of common insurance policy terms (waiting period, sub-limit, co-pay, etc.)',
    mimeType: 'application/json',
  })
  async getGlossary(uri: string, ctx: ExecutionContext): Promise<ResourceContent> {
    ctx.logger.info('Serving insurance glossary resource');
    return { type: 'json', data: INSURANCE_GLOSSARY };
  }
}