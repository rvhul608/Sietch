'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

interface WaitingPeriodStatus {
  tier: string;
  isServed: boolean;
  daysRemaining: number | null;
}

interface CoverageSummaryData {
  policyId: string;
  diagnosis: string;
  isCovered: boolean;
  waitingPeriodStatus: WaitingPeriodStatus;
  subLimitAppliedInRupees: number | null;
  coPayPercentage: number;
  finalPayoutInRupees: number;
  explanation: string;
}

function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CoverageSummary() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<CoverageSummaryData>();

  if (!isReady || !data) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', color: '#666' }}>
        Loading coverage summary...
      </div>
    );
  }

  const statusColor = data.isCovered ? '#16a34a' : '#dc2626';
  const statusLabel = data.isCovered ? 'Covered' : 'Not Covered';

  return (
    <div
      style={{
        padding: 20,
        fontFamily: 'system-ui, sans-serif',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        maxWidth: 480,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, textTransform: 'capitalize' }}>{data.diagnosis}</h3>
        <span
          style={{
            color: statusColor,
            fontWeight: 600,
            fontSize: 13,
            padding: '4px 10px',
            borderRadius: 999,
            background: data.isCovered ? '#dcfce7' : '#fee2e2',
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
        Waiting period ({data.waitingPeriodStatus.tier.replace('_', ' ')}):{' '}
        <strong>{data.waitingPeriodStatus.isServed ? 'Served' : 'Not served'}</strong>
        {!data.waitingPeriodStatus.isServed && data.waitingPeriodStatus.daysRemaining != null && (
          <> — {data.waitingPeriodStatus.daysRemaining} days remaining</>
        )}
      </div>

      {data.subLimitAppliedInRupees != null && (
        <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
          Sub-limit applied: <strong>{formatRupees(data.subLimitAppliedInRupees)}</strong>
        </div>
      )}

      {data.coPayPercentage > 0 && (
        <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
          Co-pay: <strong>{data.coPayPercentage}%</strong>
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ fontSize: 13, color: '#6b7280' }}>Estimated payout</span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{formatRupees(data.finalPayoutInRupees)}</span>
      </div>

      <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
        {data.explanation}
      </p>
    </div>
  );
}
