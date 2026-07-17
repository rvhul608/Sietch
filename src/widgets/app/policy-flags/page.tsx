'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

type Severity = 'high' | 'medium' | 'low';
type RedFlagType = 'exclusion' | 'sub_limit' | 'waiting_period' | 'co_pay' | 'other';

interface RedFlag {
  id: string;
  type: RedFlagType;
  clauseText: string;
  plainLanguage: string;
  severity: Severity;
}

interface GlossaryEntry {
  term: string;
  definition: string;
}

interface PolicyFlagsData {
  policyId: string;
  insurerName: string;
  redFlags: RedFlag[];
  glossary: GlossaryEntry[];
}

const SEVERITY_STYLES: Record<Severity, { color: string; bg: string; label: string }> = {
  high: { color: '#dc2626', bg: '#fee2e2', label: 'High' },
  medium: { color: '#d97706', bg: '#fef3c7', label: 'Medium' },
  low: { color: '#6b7280', bg: '#f3f4f6', label: 'Low' },
};

const TYPE_LABELS: Record<RedFlagType, string> = {
  exclusion: 'Exclusion',
  sub_limit: 'Sub-limit',
  waiting_period: 'Waiting Period',
  co_pay: 'Co-pay',
  other: 'Other',
};

export default function PolicyFlags() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<PolicyFlagsData>();

  if (!isReady || !data) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', color: '#666' }}>
        Loading policy analysis...
      </div>
    );
  }

  const sortedFlags = [...data.redFlags].sort((a, b) => {
    const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560 }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{data.insurerName}</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {data.redFlags.length} red flag{data.redFlags.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {sortedFlags.length === 0 ? (
        <div style={{ fontSize: 13, color: '#16a34a', marginBottom: 16 }}>
          No red flags detected in this policy.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {sortedFlags.map((flag) => {
            const style = SEVERITY_STYLES[flag.severity];
            return (
              <div
                key={flag.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${style.color}`,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {TYPE_LABELS[flag.type]}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: style.color,
                      background: style.bg,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {style.label}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#1f2937', lineHeight: 1.5 }}>
                  {flag.plainLanguage}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
                  "{flag.clauseText}"
                </p>
              </div>
            );
          })}
        </div>
      )}

      {data.glossary.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>Glossary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.glossary.map((entry) => (
              <div key={entry.term} style={{ fontSize: 12, color: '#4b5563' }}>
                <strong>{entry.term}:</strong> {entry.definition}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
