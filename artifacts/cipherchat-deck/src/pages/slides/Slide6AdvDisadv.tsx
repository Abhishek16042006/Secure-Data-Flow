export default function Slide6AdvDisadv() {
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
      <div style={{ position: 'absolute', top: '-10vh', right: '-8vw', width: '40vw', height: '40vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.06, filter: 'blur(10vw)' }} />
      <div style={{ position: 'absolute', bottom: '-10vh', left: '-5vw', width: '40vw', height: '40vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.06, filter: 'blur(10vw)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* Header nav */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4vh 6vw 0 6vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '1.8vw', height: '1.8vw', backgroundColor: '#4F7FFF', borderRadius: '0.3vw' }} />
          <span style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '-0.02em' }}>CipherChat</span>
        </div>
        <span style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.4)' }}>06 / 08</span>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '3vh 6vw 4vh 6vw' }}>

        <div style={{ display: 'inline-block', padding: '0.5vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.15)', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '2vw', color: '#4F7FFF', fontSize: '0.9vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2vh', alignSelf: 'flex-start' }}>
          Evaluation
        </div>

        <h2 style={{ fontSize: '4vw', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 3.5vh 0' }}>
          Advantages &amp; Disadvantages
        </h2>

        {/* Two-column */}
        <div style={{ display: 'flex', gap: '3vw', flex: 1 }}>

          {/* Advantages */}
          <div style={{ flex: 1, padding: '3vh 2.5vw', backgroundColor: 'rgba(39,201,63,0.06)', border: '1px solid rgba(39,201,63,0.2)', borderRadius: '1vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2.5vh' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', backgroundColor: 'rgba(39,201,63,0.15)', border: '1px solid rgba(39,201,63,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="1.2vw" height="1.2vw" viewBox="0 0 24 24" fill="none" stroke="#27C93F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span style={{ fontSize: '1.6vw', fontWeight: 700, color: '#27C93F' }}>Advantages</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#27C93F', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Server Cannot Read Messages</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Ciphertext only — a compromised server reveals nothing.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#27C93F', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Private Key Never Leaves the Browser</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Keys live in memory only and are zeroed on logout.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#27C93F', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Open Cryptographic Standards</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>ECDH P-256, AES-256-GCM — auditable, proven algorithms.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#27C93F', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Real-Time Delivery</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Socket.IO delivers messages instantly without sacrificing E2EE.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Disadvantages */}
          <div style={{ flex: 1, padding: '3vh 2.5vw', backgroundColor: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '1vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2.5vh' }}>
              <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', backgroundColor: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="1.2vw" height="1.2vw" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <span style={{ fontSize: '1.6vw', fontWeight: 700, color: '#FF6B6B' }}>Disadvantages</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Key Lost on Page Refresh</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Private key held in memory only — user must re-login after refresh.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>No Password Recovery</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Forgotten password = permanent loss of message history.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Browser Dependency</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Requires Web Crypto API support — limited to modern browsers only.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1vw', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B', marginTop: '0.7vh', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '1.3vw', fontWeight: 600, marginBottom: '0.3vh' }}>Higher Complexity</div>
                  <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>More complex to implement and maintain than standard messaging apps.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
