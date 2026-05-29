export default function Slide2WhyPrivacy() {
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
      {/* Blue blob */}
      <div style={{ position: 'absolute', top: '-10vh', right: '-8vw', width: '40vw', height: '40vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.06, filter: 'blur(8vw)' }} />
      {/* Purple blob */}
      <div style={{ position: 'absolute', bottom: '-15vh', left: '-5vw', width: '45vw', height: '45vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.07, filter: 'blur(10vw)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* Header nav */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4vh 6vw 0 6vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '1.8vw', height: '1.8vw', backgroundColor: '#4F7FFF', borderRadius: '0.3vw' }} />
          <span style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '-0.02em' }}>CipherChat</span>
        </div>
        <span style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.4)' }}>02 / 05</span>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flex: 1, gap: '5vw', padding: '4vh 6vw 4vh 6vw', alignItems: 'center' }}>

        {/* Left column */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-block', padding: '0.5vh 1.2vw', backgroundColor: 'rgba(79,127,255,0.15)', border: '1px solid rgba(79,127,255,0.3)', borderRadius: '2vw', color: '#4F7FFF', fontSize: '0.9vw', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5vh' }}>
            The Case For Privacy
          </div>

          <h2 style={{ fontSize: '4vw', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 3vh 0' }}>
            Why Privacy<br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Matters</span>
          </h2>

          {/* Reason 1 */}
          <div style={{ display: 'flex', gap: '1.2vw', marginBottom: '2.5vh', alignItems: 'flex-start' }}>
            <div style={{ minWidth: '2.2vw', height: '2.2vw', borderRadius: '0.4vw', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.2vh' }}>
              <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', backgroundColor: '#4F7FFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.5vh' }}>Data Breaches Are Common</div>
              <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Billions of user records are exposed every year through server-side breaches.</div>
            </div>
          </div>

          {/* Reason 2 */}
          <div style={{ display: 'flex', gap: '1.2vw', marginBottom: '2.5vh', alignItems: 'flex-start' }}>
            <div style={{ minWidth: '2.2vw', height: '2.2vw', borderRadius: '0.4vw', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.2vh' }}>
              <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', backgroundColor: '#4F7FFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.5vh' }}>Servers Can Read Your Messages</div>
              <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Most apps decrypt messages on the server — providers have full read access to conversations.</div>
            </div>
          </div>

          {/* Reason 3 */}
          <div style={{ display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
            <div style={{ minWidth: '2.2vw', height: '2.2vw', borderRadius: '0.4vw', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.2vh' }}>
              <div style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', backgroundColor: '#4F7FFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4vw', fontWeight: 600, marginBottom: '0.5vh' }}>Surveillance Risks</div>
              <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Without end-to-end encryption, third parties can intercept communications in transit.</div>
            </div>
          </div>
        </div>

        {/* Right column — CipherChat reference card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
          <div style={{ padding: '3vh 2.5vw', backgroundColor: '#131726', border: '1px solid rgba(124,107,240,0.3)', borderRadius: '1vw', boxShadow: '0 2vh 4vh rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#7C6BF0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5vh' }}>How CipherChat Solves This</div>
            <div style={{ fontSize: '1.4vw', fontWeight: 700, marginBottom: '1vh', lineHeight: 1.3 }}>The server is cryptographically blind.</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>Messages are encrypted in the browser before reaching the server. The server stores only ciphertext — it has no keys and cannot read anything.</div>
          </div>

          <div style={{ display: 'flex', gap: '2vw' }}>
            <div style={{ flex: 1, padding: '2.5vh 2vw', backgroundColor: '#131726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1vw' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 800, color: '#4F7FFF', lineHeight: 1 }}>0</div>
              <div style={{ fontSize: '1.1vw', fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: '1vh', lineHeight: 1.4 }}>Plaintext stored on server</div>
            </div>
            <div style={{ flex: 1, padding: '2.5vh 2vw', backgroundColor: '#131726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1vw' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 800, color: '#7C6BF0', lineHeight: 1 }}>E2EE</div>
              <div style={{ fontSize: '1.1vw', fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: '1vh', lineHeight: 1.4 }}>Every message, every time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
