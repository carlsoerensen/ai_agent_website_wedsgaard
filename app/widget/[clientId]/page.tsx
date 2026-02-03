'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Widget from '@/components/Widget';
import { getClientConfig } from '@/lib/clients';
import type { ClientConfig } from '@/lib/types';

function WidgetContent() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = () => {
      const clientConfig = getClientConfig(clientId);
      if (clientConfig) {
        setConfig(clientConfig);
      } else {
        setError(`Client "${clientId}" not found`);
      }
    };
    
    loadConfig();
  }, [clientId]);

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#666'
      }}>
        {error}
      </div>
    );
  }

  if (!config) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%', 
      height: '100%',
      overflow: 'hidden',
      background: 'transparent',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <Widget config={config} isEmbedded={true} />
    </div>
  );
}

export default function ClientWidgetPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    }>
      <WidgetContent />
    </Suspense>
  );
}
