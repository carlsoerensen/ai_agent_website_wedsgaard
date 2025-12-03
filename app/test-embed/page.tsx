'use client';

import Script from 'next/script';

export default function TestEmbedPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f5' }}>
      {/* Load the LIVE Vercel widget - this is the exact embed code for clients */}
      <Script 
        src="https://ai-agent-website-wedsgaard.vercel.app/widget.js" 
        strategy="afterInteractive"
      />
    </div>
  );
}

