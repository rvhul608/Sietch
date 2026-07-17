'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  cashless: boolean;
  insuranceProviders: string[];
  lat?: number;
  lng?: number;
}

export default function HospitalMap() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const hospitals = getToolOutput<Hospital[]>();

  if (!isReady || !hospitals) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', color: '#666' }}>
        Loading network hospitals...
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', color: '#666' }}>
        No network hospitals found for this search.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 560,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
        {hospitals.length} network hospital{hospitals.length !== 1 ? 's' : ''} found
      </div>

      {hospitals.map((h) => (
        <div
          key={h.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: 0, fontSize: 15 }}>{h.name}</h4>
            {h.cashless && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#16a34a',
                  background: '#dcfce7',
                  padding: '3px 8px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                  marginLeft: 8,
                }}
              >
                Cashless
              </span>
            )}
          </div>

          <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
            {h.address}, {h.city}, {h.state}
          </div>

          {h.phone && (
            <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{h.phone}</div>
          )}

          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
            Accepted: {h.insuranceProviders.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}
