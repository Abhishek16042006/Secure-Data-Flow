export default function Slide3ProblemStatement() {
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
      <div style={{ position: 'absolute', top: '15vh', left: '20vw', width: '40vw', height: '40vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.07, filter: 'blur(12vw)' }} />
      <div style={{ position: 'absolute', bottom: '-10vh', right: '5vw', width: '35vw', height: '35vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.05, filter: 'blur(10vw)' }} />
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
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '4vh 6vw 5vh 6vw', justifyContent: 'center' }}>

        <div style={{ display: 'inline-block', padding: '0.5vh 1.2vw', backgroundColor: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '2vw', color: '#FF6B6B', fontSize: '0.9vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2vh', alignSelf: 'flex-start' }}>
          Problem Statement
        </div>

        <h2 style={{ fontSize: '4.5vw', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 4vh 0' }}>
          Existing Messaging Apps<br />
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Are Not Truly Private</span>
        </h2>

        {/* Two-column problem list */}
        <div style={{ display: 'flex', gap: '4vw' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            {/* Problem 1 */}
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '1.8vw', height: '1.8vw', borderRadius: '50%', backgroundColor: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.3vh' }}>
                <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.4vh' }}>Server-Side Plaintext Storage</div>
                <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Messages decrypted and stored in cleartext — any server breach exposes all conversations.</div>
              </div>
            </div>

            {/* Problem 2 */}
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '1.8vw', height: '1.8vw', borderRadius: '50%', backgroundColor: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.3vh' }}>
                <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.4vh' }}>Provider-Controlled Keys</div>
                <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>The service provider manages encryption keys — users must blindly trust the platform.</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            {/* Problem 3 */}
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '1.8vw', height: '1.8vw', borderRadius: '50%', backgroundColor: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.3vh' }}>
                <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.4vh' }}>Man-in-the-Middle Attacks</div>
                <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Without key verification, an attacker could impersonate another user and intercept messages.</div>
              </div>
            </div>

            {/* Problem 4 */}
            <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '1.8vw', height: '1.8vw', borderRadius: '50%', backgroundColor: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.3vh' }}>
                <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.4vh' }}>Replay Attacks</div>
                <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Captured messages can be replayed to inject duplicate content or disrupt communication.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
