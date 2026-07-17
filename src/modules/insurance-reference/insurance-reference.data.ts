export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const INSURANCE_GLOSSARY: GlossaryEntry[] = [
  { term: 'Waiting Period', definition: 'The time you must wait after buying a policy before certain claims become payable. Includes an initial period (usually 30 days, covers almost nothing), a disease-specific period (often 2 years, for named conditions), and a pre-existing-condition period (often 3-4 years).' },
  { term: 'Sub-limit', definition: 'A cap on how much the insurer will pay for a specific treatment or category, even if your overall sum insured is higher. E.g. a ₹40,000 sub-limit on cataract surgery means you pay anything above that yourself.' },
  { term: 'Co-pay', definition: 'A fixed percentage of every claim that you must pay yourself, regardless of the claim amount. A 20% co-pay on a ₹1,00,000 claim means you pay ₹20,000.' },
  { term: 'Pre-existing Condition', definition: 'Any diagnosed illness or condition you had before buying the policy. Usually subject to a longer waiting period than new conditions.' },
  { term: 'Cashless Treatment', definition: 'Treatment at a network hospital where the insurer settles the bill directly with the hospital, so you do not pay upfront and claim reimbursement later.' },
  { term: 'Network Hospital', definition: 'A hospital that has a direct tie-up with your insurer for cashless treatment. Treatment outside the network usually requires you to pay first and file for reimbursement.' },
  { term: 'Exclusion', definition: 'A condition, treatment, or circumstance the policy explicitly does not cover, under any circumstances, regardless of waiting periods served.' },
];