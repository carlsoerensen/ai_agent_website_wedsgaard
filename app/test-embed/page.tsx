'use client';

import Script from 'next/script';

export default function TestEmbedPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f5' }}>
      {/* Load the LOCAL widget script for immediate testing of changes */}
      <Script 
        src="/widget.js" 
        strategy="lazyOnload"
      />
    </div>
  );
}

