import Widget from '@/components/Widget';

export default function Home() {
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
        <Widget />
      </div>
    </main>
  );
}


