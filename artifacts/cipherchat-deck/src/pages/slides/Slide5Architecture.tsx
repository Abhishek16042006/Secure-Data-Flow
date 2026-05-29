export default function Slide5Architecture() {
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
      <div style={{ position: 'absolute', top: '-5vh', left: '-5vw', width: '35vw', height: '35vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.06, filter: 'blur(10vw)' }} />
      <div style={{ position: 'absolute', bottom: '-5vh', right: '-5vw', width: '35vw', height: '35vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.06, filter: 'blur(10vw)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* Header nav */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3vh 6vw 0 6vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '1.8vw', height: '1.8vw', backgroundColor: '#4F7FFF', borderRadius: '0.3vw' }} />
          <span style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '-0.02em' }}>CipherChat</span>
        </div>
        <span style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.4)' }}>05 / 09</span>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 10, padding: '2vh 6vw 0 6vw' }}>
        <div style={{ display: 'inline-block', padding: '0.4vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.15)', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '2vw', color: '#7C6BF0', fontSize: '0.85vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2vh' }}>
          Architecture
        </div>
        <h2 style={{ fontSize: '3.2vw', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          System Architecture Design
        </h2>
      </div>

      {/* Diagram */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', padding: '1.5vh 4vw 3vh 4vw', gap: 0 }}>

        {/* ── Alice Browser ── */}
        <div style={{ flex: 1, height: '72vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1629', border: '1.5px solid rgba(79,127,255,0.4)', borderRadius: '1vw', padding: '2.2vh 1.8vw' }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', marginBottom: '2vh', paddingBottom: '1.5vh', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '2.4vw', height: '2.4vw', borderRadius: '50%', backgroundColor: 'rgba(79,127,255,0.2)', border: '1.5px solid #4F7FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1vw' }}>👤</div>
            <div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700 }}>Alice</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.45)' }}>Browser (Client)</div>
            </div>
          </div>
          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6vh', flex: 1 }}>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.1)', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '0.4vh' }}>① Key Generation</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>ECDH P-256 key pair generated in browser via Web Crypto API</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.1)', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '0.4vh' }}>② PBKDF2 Key Wrapping</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Private key encrypted with password-derived key (100k iterations)</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.1)', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '0.4vh' }}>③ ECDH Key Agreement</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Shared AES key derived from Alice's private + Bob's public key</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(39,201,63,0.08)', border: '1px solid rgba(39,201,63,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#27C93F', marginBottom: '0.4vh' }}>④ AES-256-GCM Encrypt</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Plaintext → Ciphertext using fresh random IV per message</div>
            </div>
            {/* Private key badge */}
            <div style={{ marginTop: 'auto', padding: '1vh 1.2vw', backgroundColor: 'rgba(255,193,7,0.08)', border: '1px dashed rgba(255,193,7,0.35)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
              <span style={{ fontSize: '1vw' }}>🔐</span>
              <span style={{ fontSize: '0.85vw', color: 'rgba(255,193,7,0.85)', fontWeight: 500 }}>Private key in memory only — never sent to server</span>
            </div>
          </div>
        </div>

        {/* ── Arrow: Alice → Network ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0.8vw', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75vw', color: 'rgba(255,255,255,0.4)', marginBottom: '0.8vh', textAlign: 'center', lineHeight: 1.4 }}>Encrypted<br/>Ciphertext</div>
          <svg width="3.5vw" height="1.6vh" viewBox="0 0 56 12" fill="none">
            <line x1="0" y1="6" x2="46" y2="6" stroke="rgba(79,127,255,0.6)" strokeWidth="1.5" strokeDasharray="4 2" />
            <polyline points="46,2 56,6 46,10" fill="none" stroke="rgba(79,127,255,0.8)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* ── Server ── */}
        <div style={{ flex: 1.1, height: '72vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1629', border: '1.5px solid rgba(124,107,240,0.4)', borderRadius: '1vw', padding: '2.2vh 1.8vw' }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', marginBottom: '2vh', paddingBottom: '1.5vh', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '2.4vw', height: '2.4vw', borderRadius: '50%', backgroundColor: 'rgba(124,107,240,0.2)', border: '1.5px solid #7C6BF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1vw' }}>🖥</div>
            <div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700 }}>Server</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.45)' }}>Express 5 + PostgreSQL + Socket.IO</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4vh', flex: 1 }}>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.1)', border: '1px solid rgba(124,107,240,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#7C6BF0', marginBottom: '0.4vh' }}>Express API + Helmet</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Auth routes, rate limiting, session hardening, security headers</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.1)', border: '1px solid rgba(124,107,240,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#7C6BF0', marginBottom: '0.4vh' }}>PostgreSQL (Drizzle ORM)</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Stores: public keys · encrypted private key blobs · ciphertext</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.1)', border: '1px solid rgba(124,107,240,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#7C6BF0', marginBottom: '0.4vh' }}>Socket.IO (Real-time)</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Relays encrypted messages live — never decrypts payload</div>
            </div>

            {/* Zero-knowledge badge */}
            <div style={{ marginTop: 'auto', padding: '1.5vh 1.2vw', backgroundColor: 'rgba(124,107,240,0.1)', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#7C6BF0', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zero-Knowledge Principle</div>
              <div style={{ display: 'flex', gap: '0.8vw' }}>
                <div style={{ flex: 1, padding: '0.8vh 0.8vw', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '0.4vw', fontSize: '0.8vw', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>✗ Plaintext</div>
                <div style={{ flex: 1, padding: '0.8vh 0.8vw', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '0.4vw', fontSize: '0.8vw', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>✗ Private Keys</div>
                <div style={{ flex: 1, padding: '0.8vh 0.8vw', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '0.4vw', fontSize: '0.8vw', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>✓ Ciphertext</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Arrow: Network → Bob ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0.8vw', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75vw', color: 'rgba(255,255,255,0.4)', marginBottom: '0.8vh', textAlign: 'center', lineHeight: 1.4 }}>Encrypted<br/>Ciphertext</div>
          <svg width="3.5vw" height="1.6vh" viewBox="0 0 56 12" fill="none">
            <line x1="0" y1="6" x2="46" y2="6" stroke="rgba(79,127,255,0.6)" strokeWidth="1.5" strokeDasharray="4 2" />
            <polyline points="46,2 56,6 46,10" fill="none" stroke="rgba(79,127,255,0.8)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* ── Bob Browser ── */}
        <div style={{ flex: 1, height: '72vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1629', border: '1.5px solid rgba(79,127,255,0.4)', borderRadius: '1vw', padding: '2.2vh 1.8vw' }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', marginBottom: '2vh', paddingBottom: '1.5vh', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '2.4vw', height: '2.4vw', borderRadius: '50%', backgroundColor: 'rgba(79,127,255,0.2)', border: '1.5px solid #4F7FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1vw' }}>👤</div>
            <div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700 }}>Bob</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.45)' }}>Browser (Client)</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6vh', flex: 1 }}>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.1)', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '0.4vh' }}>① Unlock Private Key</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>PBKDF2 derives decryption key from Bob's password on login</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.1)', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '0.4vh' }}>② ECDH Key Agreement</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Shared AES key derived from Bob's private + Alice's public key</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.1)', border: '1px solid rgba(79,127,255,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '0.4vh' }}>③ Fingerprint Verify (TOFU)</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>SHA-256 of Alice's public key matched against stored trust record</div>
            </div>
            <div style={{ padding: '1.2vh 1.2vw', backgroundColor: 'rgba(39,201,63,0.08)', border: '1px solid rgba(39,201,63,0.25)', borderRadius: '0.6vw' }}>
              <div style={{ fontSize: '1vw', fontWeight: 700, color: '#27C93F', marginBottom: '0.4vh' }}>④ AES-256-GCM Decrypt</div>
              <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Ciphertext → Plaintext decrypted entirely in Bob's browser</div>
            </div>
            {/* Private key badge */}
            <div style={{ marginTop: 'auto', padding: '1vh 1.2vw', backgroundColor: 'rgba(255,193,7,0.08)', border: '1px dashed rgba(255,193,7,0.35)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
              <span style={{ fontSize: '1vw' }}>🔐</span>
              <span style={{ fontSize: '0.85vw', color: 'rgba(255,193,7,0.85)', fontWeight: 500 }}>Private key in memory only — zeroed on logout</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
