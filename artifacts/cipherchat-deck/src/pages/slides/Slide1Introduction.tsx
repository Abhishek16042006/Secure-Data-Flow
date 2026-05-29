import collegeLogo from '@assets/WhatsApp_Image_2026-05-29_at_8.32.59_PM_1780067554256.jpeg';

export default function Slide1Introduction() {
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
        alignItems: 'center',
        position: 'relative',
        color: '#FFFFFF',
      }}
    >
      {/* Blue blob top-right */}
      <div style={{ position: 'absolute', top: '-15vh', right: '-10vw', width: '45vw', height: '45vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.06, filter: 'blur(8vw)' }} />
      {/* Purple blob bottom-left */}
      <div style={{ position: 'absolute', bottom: '-20vh', left: '-10vw', width: '50vw', height: '50vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.06, filter: 'blur(10vw)' }} />
      {/* Grid overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* College Logo */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: '7vh', padding: '1.5vh 3vw', backgroundColor: '#FFFFFF', borderRadius: '0.8vw', display: 'inline-flex', alignItems: 'center' }}>
        <img src={collegeLogo} crossOrigin="anonymous" alt="East Point College of Engineering & Technology" style={{ height: '8vh', objectFit: 'contain' }} />
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '4vh' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5vh 1.5vw', backgroundColor: 'rgba(124, 107, 240, 0.15)', border: '1px solid rgba(124, 107, 240, 0.3)', borderRadius: '2vw', color: '#7C6BF0', fontSize: '1vw', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2.5vh' }}>
          Student Project · 2026
        </div>

        {/* Project title */}
        <h1 style={{ fontSize: '7vw', fontWeight: 800, margin: '0 0 1.5vh 0', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          CipherChat
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '2vw', fontWeight: 300, color: 'rgba(255,255,255,0.7)', margin: '0 0 1vh 0', letterSpacing: '0.01em' }}>
          End-to-End Encrypted Messaging System
        </p>

        <p style={{ fontSize: '1.3vw', fontWeight: 400, color: 'rgba(255,255,255,0.45)', margin: '0 0 4vh 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Department of Information Science &amp; Engineering
        </p>

        {/* Divider */}
        <div style={{ width: '6vw', height: '2px', backgroundColor: '#4F7FFF', marginBottom: '4vh', borderRadius: '2px' }} />

        {/* Team members */}
        <p style={{ fontSize: '1.1vw', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2vh' }}>
          Project Team
        </p>
        <div style={{ display: 'flex', gap: '2.5vw', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1vh auto', fontSize: '1.2vw', fontWeight: 700, color: '#4F7FFF' }}>01</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 500 }}>Member Name 1</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1vh auto', fontSize: '1.2vw', fontWeight: 700, color: '#4F7FFF' }}>02</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 500 }}>Member Name 2</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', backgroundColor: 'rgba(124,107,240,0.2)', border: '1px solid rgba(124,107,240,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1vh auto', fontSize: '1.2vw', fontWeight: 700, color: '#7C6BF0' }}>03</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 500 }}>Member Name 3</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', backgroundColor: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1vh auto', fontSize: '1.2vw', fontWeight: 700, color: '#4F7FFF' }}>04</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 500 }}>Member Name 4</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', backgroundColor: 'rgba(124,107,240,0.2)', border: '1px solid rgba(124,107,240,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1vh auto', fontSize: '1.2vw', fontWeight: 700, color: '#7C6BF0' }}>05</div>
            <div style={{ fontSize: '1.1vw', fontWeight: 500 }}>Member Name 5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
