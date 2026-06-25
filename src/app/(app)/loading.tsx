export default function Loading() {
  return (
    <div style={{ background: '#0B0B14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(93,80,214,0.2)',
          borderTopColor: '#5D50D6',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Cargando...</p>
      </div>
    </div>
  )
}
