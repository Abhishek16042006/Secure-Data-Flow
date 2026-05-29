export default function Slide7Conclusion() {
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
      {/* Central glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60vw', height: '60vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.06, filter: 'blur(15vw)' }} />
      <div style={{ position: 'absolute', bottom: '-10vh', right: '-5vw', width: '35vw', height: '35vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.08, filter: 'blur(10vw)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* Header nav */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4vh 6vw 0 6vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '1.8vw', height: '1.8vw', backgroundColor: '#4F7FFF', borderRadius: '0.3vw' }} />
          <span style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '-0.02em' }}>CipherChat</span>
        </div>
        <span style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.4)' }}>07 / 08</span>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '3vh 6vw 5vh 6vw', justifyContent: 'center' }}>

        <div style={{ display: 'inline-block', padding: '0.5vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.15)', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '2vw', color: '#7C6BF0', fontSize: '0.9vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5vh', alignSelf: 'flex-start' }}>
          Conclusion
        </div>

        <h2 style={{ fontSize: '4.5vw', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 3.5vh 0' }}>
          A Working E2EE System,<br />
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Built From First Principles</span>
        </h2>

        <div style={{ display: 'flex', gap: '3vw', marginBottom: '4vh' }}>
          {/* Summary points */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '2vw', height: '2vw', borderRadius: '0.4vw', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="1vw" height="1vw" viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: '1.3vw', fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>CipherChat proves that a zero-knowledge messaging system is achievable using only standard browser APIs — no native apps, no proprietary crypto libraries.</div>
            </div>
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '2vw', height: '2vw', borderRadius: '0.4vw', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="1vw" height="1vw" viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: '1.3vw', fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>Every security measure — key management, replay protection, TOFU verification, session hardening — is implemented end-to-end with full unit test coverage.</div>
            </div>
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '2vw', height: '2vw', borderRadius: '0.4vw', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="1vw" height="1vw" viewBox="0 0 24 24" fill="none" stroke="#4F7FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: '1.3vw', fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>The project serves as an open, educational reference for building privacy-first applications using modern web cryptography.</div>
            </div>
          </div>

          {/* Tech stack card */}
          <div style={{ flex: 1, padding: '3vh 2.5vw', backgroundColor: '#131726', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1vw', display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5vh' }}>Tech Stack</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1vh 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.6)' }}>Frontend</span>
              <span style={{ fontSize: '1.1vw', fontWeight: 600, color: '#4F7FFF' }}>React + Vite</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1vh 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.6)' }}>Backend</span>
              <span style={{ fontSize: '1.1vw', fontWeight: 600, color: '#4F7FFF' }}>Express 5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1vh 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.6)' }}>Database</span>
              <span style={{ fontSize: '1.1vw', fontWeight: 600, color: '#7C6BF0' }}>PostgreSQL</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1vh 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.6)' }}>Crypto</span>
              <span style={{ fontSize: '1.1vw', fontWeight: 600, color: '#7C6BF0' }}>Web Crypto API</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1vh 0' }}>
              <span style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.6)' }}>Real-time</span>
              <span style={{ fontSize: '1.1vw', fontWeight: 600, color: '#4F7FFF' }}>Socket.IO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
