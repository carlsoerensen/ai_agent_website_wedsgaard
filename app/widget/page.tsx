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
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Widget webhookUrl={webhookUrl || undefined} />
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

