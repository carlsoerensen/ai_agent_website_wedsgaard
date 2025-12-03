'use client';

import Script from 'next/script';

export default function TestEmbedPage() {
  return (
    <div style={{ width: '100vw', height: '50vh', background: '#f5f5f5' }}>
      {/* Load the LIVE Vercel widget script */}
      <Script 
        src="https://ai-agent-website-wedsgaard.vercel.app/widget.js" 
        strategy="lazyOnload"
      />
    </div>
  );
}

