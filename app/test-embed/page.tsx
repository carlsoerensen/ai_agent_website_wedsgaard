'use client';

import Script from 'next/script';

export default function TestEmbedPage() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px', 
      margin: '40px auto', 
      padding: '20px',
      textAlign: 'center' 
    }}>
      <h1>Vercel Embed Test</h1>
      <p>This page is running locally (localhost:3000), but it is loading the widget from your <strong>live Vercel deployment</strong>.</p>
      
      <div style={{ 
        background: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        textAlign: 'left'
      }}>
        <strong>Script Source:</strong>
        <code style={{ display: 'block', marginTop: '10px', wordBreak: 'break-all' }}>
          /widget.js (Local testing)
        </code>
      </div>

      {/* Load the widget from local/relative path for testing */}
      <Script 
        src="/widget.js" 
        strategy="lazyOnload"
      />
    </div>
  );
}

