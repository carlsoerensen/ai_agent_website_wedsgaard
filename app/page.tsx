'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/Widget';
import { getClientConfig } from '@/lib/clients';
import type { ClientConfig } from '@/lib/types';

export default function Home() {
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    // Load wedsgaard config for the demo page
    const clientConfig = getClientConfig('wedsgaard');
    setConfig(clientConfig);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          AI Agent Widget
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          The widget is available in the bottom right corner
        </p>
        {config && <Widget config={config} />}
      </div>
    </main>
  );
}
