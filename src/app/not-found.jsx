export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      background: '#fafafa',
      color: '#333',
      padding: '24px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 300, margin: 0, color: '#CEA268' }}>404</h1>
      <p style={{ fontSize: '16px', marginTop: '12px', color: '#666' }}>Page not found</p>
    </div>
  );
}
