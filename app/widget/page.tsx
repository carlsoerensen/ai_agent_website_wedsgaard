'use client';

import { useEffect, useState, Suspense } from 'react';
import Widget from '@/components/Widget';
import { useSearchParams } from 'next/navigation';
import { getClientConfig } from '@/lib/clients';
import type { ClientConfig } from '@/lib/types';

/**
 * Legacy widget page for backward compatibility
 * This page defaults to 'wedsgaard' client config to maintain compatibility
 * with existing embed code that doesn't use the new data-client attribute.
 * 
 * New clients should use /widget/[clientId] route instead.
 */
function WidgetContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    // For backward compatibility, default to 'wedsgaard' config
    // This ensures the existing live embed continues to work
    const clientConfig = getClientConfig('wedsgaard');
    
    if (clientConfig) {
      // Check if a webhookUrl was passed via query param (legacy support)
      const queryWebhookUrl = searchParams.get('webhookUrl');
      if (queryWebhookUrl) {
        // Override webhook URL if provided via query param
        setConfig({
          ...clientConfig,
          webhookUrl: queryWebhookUrl
        });
      } else {
        setConfig(clientConfig);
      }
    }
  }, [searchParams]);

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

export default function WidgetPage() {
  return (
    <Suspense fallback={<div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <WidgetContent />
    </Suspense>
  );
}
