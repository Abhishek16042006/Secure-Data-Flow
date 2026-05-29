export default function Slide5KeyFeatures() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0C0F1A',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        color: '#FFFFFF',
      }}
    >
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '55vw', height: '55vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.05, filter: 'blur(15vw)' }} />
      <div style={{ position: 'absolute', bottom: '-10vh', right: '-5vw', width: '35vw', height: '35vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.08, filter: 'blur(8vw)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* Header nav */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4vh 6vw 0 6vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '1.8vw', height: '1.8vw', backgroundColor: '#4F7FFF', borderRadius: '0.3vw' }} />
          <span style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '-0.02em' }}>CipherChat</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4vh 6vw 5vh 6vw', justifyContent: 'center' }}>

        <div style={{ display: 'inline-block', padding: '0.5vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.15)', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '2vw', color: '#7C6BF0', fontSize: '0.9vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2vh' }}>
          Security Features
        </div>

        <h2 style={{ fontSize: '4vw', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1vh 0', textAlign: 'center' }}>
          Built Secure by Design
        </h2>
        <p style={{ fontSize: '1.3vw', fontWeight: 300, color: 'rgba(255,255,255,0.55)', margin: '0 0 4vh 0', textAlign: 'center' }}>
          Defense in depth — every layer is hardened
        </p>

        {/* 3 feature cards */}
        <div style={{ display: 'flex', gap: '2.5vw', width: '100%' }}>

          {/* Card 1 */}
          <div style={{ flex: 1, padding: '3.5vh 2.5vw', backgroundColor: '#131726', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '1vw', display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
            <div style={{ width: '4vw', height: '4vw', backgroundColor: 'rgba(79,127,255,0.15)', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '0.8vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="2vw" height="2vw" viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 700 }}>ECDH + AES-256-GCM</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Elliptic-curve key exchange. No symmetric key ever leaves the browser. Every message encrypted with a fresh random IV.</div>
          </div>

          {/* Card 2 */}
          <div style={{ flex: 1, padding: '3.5vh 2.5vw', backgroundColor: '#131726', border: '1px solid rgba(124,107,240,0.25)', borderRadius: '1vw', display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
            <div style={{ width: '4vw', height: '4vw', backgroundColor: 'rgba(124,107,240,0.15)', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '0.8vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="2vw" height="2vw" viewBox="0 0 24 24" fill="none" stroke="#7C6BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 700 }}>Session Security</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Session regeneration on login, strict SameSite cookies, rate limiting (5 auth/15 min), Helmet security headers.</div>
          </div>

          {/* Card 3 */}
          <div style={{ flex: 1, padding: '3.5vh 2.5vw', backgroundColor: '#131726', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '1vw', display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
            <div style={{ width: '4vw', height: '4vw', backgroundColor: 'rgba(79,127,255,0.15)', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '0.8vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="2vw" height="2vw" viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 700 }}>TOFU + Replay Protection</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>SHA-256 key fingerprints verify identity. UUID + timestamp validation blocks replay attacks at the database level.</div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{ marginTop: '4vh', padding: '2vh 4vw', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.8vw', textAlign: 'center' }}>
          <span style={{ fontSize: '1.3vw', fontWeight: 300, color: 'rgba(255,255,255,0.55)' }}>Zero-knowledge server</span>
          <span style={{ fontSize: '1.3vw', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: '0 1vw' }}>·</span>
          <span style={{ fontSize: '1.3vw', fontWeight: 700, color: '#4F7FFF' }}>Full end-to-end encryption</span>
          <span style={{ fontSize: '1.3vw', fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: '0 1vw' }}>·</span>
          <span style={{ fontSize: '1.3vw', fontWeight: 300, color: 'rgba(255,255,255,0.55)' }}>19 unit tests verified</span>
        </div>
      </div>
    </div>
  );
}
