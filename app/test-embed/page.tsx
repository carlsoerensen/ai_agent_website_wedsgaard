'use client';

import Script from 'next/script';

export default function TestEmbedPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f5' }}>
      {/* Minimal test page with just the script */}
      <Script 
        src="/widget.js" 
        strategy="lazyOnload"
      />
    </div>
  );
}

