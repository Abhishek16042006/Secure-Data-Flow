export default function Slide4Workflow() {
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
      <div style={{ position: 'absolute', top: '10vh', right: '-5vw', width: '40vw', height: '40vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.05, filter: 'blur(10vw)' }} />
      <div style={{ position: 'absolute', bottom: '-5vh', left: '10vw', width: '35vw', height: '35vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.07, filter: 'blur(10vw)' }} />
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
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '3vh 6vw 4vh 6vw' }}>
        <div style={{ display: 'inline-block', padding: '0.5vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.15)', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '2vw', color: '#4F7FFF', fontSize: '0.9vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2vh', alignSelf: 'flex-start' }}>
          How It Works
        </div>

        <h2 style={{ fontSize: '3.5vw', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 3.5vh 0' }}>
          Simple Workflow
        </h2>

        {/* 6-step flow in 2 rows of 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>

          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'center' }}>
            {/* Step 1 */}
            <div style={{ flex: 1, padding: '2.5vh 1.8vw', backgroundColor: '#131726', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '0.8vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 1</div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '0.5vh' }}>Register</div>
              <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Browser generates an ECDH key pair using the Web Crypto API. Private key is encrypted with your password.</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: '2vw', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</div>

            {/* Step 2 */}
            <div style={{ flex: 1, padding: '2.5vh 1.8vw', backgroundColor: '#131726', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '0.8vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 2</div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '0.5vh' }}>Login</div>
              <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Password decrypts the private key inside the browser. The decrypted key lives in memory only — never on disk.</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: '2vw', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</div>

            {/* Step 3 */}
            <div style={{ flex: 1, padding: '2.5vh 1.8vw', backgroundColor: '#131726', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '0.8vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#7C6BF0', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 3</div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '0.5vh' }}>Compose</div>
              <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Browser derives a shared AES key via ECDH (your private key + recipient's public key) and encrypts the message.</div>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'center' }}>
            {/* Step 4 */}
            <div style={{ flex: 1, padding: '2.5vh 1.8vw', backgroundColor: '#131726', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '0.8vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#7C6BF0', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 4</div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '0.5vh' }}>Send</div>
              <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Ciphertext (not plaintext) is sent to the server with a unique message ID and timestamp for replay protection.</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: '2vw', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</div>

            {/* Step 5 */}
            <div style={{ flex: 1, padding: '2.5vh 1.8vw', backgroundColor: '#131726', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '0.8vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 5</div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '0.5vh' }}>Server Stores</div>
              <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Server validates the message ID, stores the opaque ciphertext in PostgreSQL, and delivers it via Socket.IO.</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: '2vw', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</div>

            {/* Step 6 */}
            <div style={{ flex: 1, padding: '2.5vh 1.8vw', backgroundColor: '#131726', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '0.8vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#4F7FFF', marginBottom: '1vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 6</div>
              <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '0.5vh' }}>Decrypt</div>
              <div style={{ fontSize: '1.05vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Recipient's browser fetches ciphertext and decrypts it locally using their private key. Server never sees plaintext.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
