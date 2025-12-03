'use client';

import { useEffect, useState, Suspense } from 'react';
import Widget from '@/components/Widget';
import { useSearchParams } from 'next/navigation';

function WidgetContent() {
  const searchParams = useSearchParams();
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = searchParams.get('webhookUrl');
    setWebhookUrl(url);
  }, [searchParams]);

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%', 
      height: '100%',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      <Widget webhookUrl={webhookUrl || undefined} isEmbedded={true} />
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

