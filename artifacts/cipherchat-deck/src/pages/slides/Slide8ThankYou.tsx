import collegeLogo from '@assets/WhatsApp_Image_2026-05-29_at_8.32.59_PM_1780067554256.jpeg';

export default function Slide8ThankYou() {
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
        justifyContent: 'center',
        position: 'relative',
        color: '#FFFFFF',
      }}
    >
      {/* Central glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '70vw', height: '70vw', borderRadius: '50%', backgroundColor: '#7C6BF0', opacity: 0.06, filter: 'blur(15vw)' }} />
      <div style={{ position: 'absolute', top: '-10vh', right: '-5vw', width: '40vw', height: '40vw', borderRadius: '50%', backgroundColor: '#4F7FFF', opacity: 0.05, filter: 'blur(10vw)' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4vw 4vw', pointerEvents: 'none' }} />

      {/* Header nav */}
      <div style={{ position: 'absolute', top: '4vh', left: '6vw', right: '6vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '1.8vw', height: '1.8vw', backgroundColor: '#4F7FFF', borderRadius: '0.3vw' }} />
          <span style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '-0.02em' }}>CipherChat</span>
        </div>
        <span style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.4)' }}>09 / 09</span>
      </div>

      {/* Main content — centered */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        {/* Decorative line above */}
        <div style={{ width: '4vw', height: '2px', backgroundColor: '#4F7FFF', marginBottom: '3vh', borderRadius: '2px' }} />

        {/* Thank You */}
        <h1 style={{ fontSize: '9vw', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 1.5vh 0' }}>
          Thank You
        </h1>

        <p style={{ fontSize: '1.8vw', fontWeight: 300, color: 'rgba(255,255,255,0.55)', margin: '0 0 4vh 0', letterSpacing: '0.02em' }}>
          Questions &amp; Discussion
        </p>

        {/* Divider */}
        <div style={{ width: '6vw', height: '2px', backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: '4vh', borderRadius: '2px' }} />

        {/* Project info */}
        <div style={{ display: 'flex', gap: '4vw', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1vw', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8vh' }}>Project</div>
            <div style={{ fontSize: '1.4vw', fontWeight: 700, color: '#4F7FFF' }}>CipherChat</div>
          </div>
          <div style={{ width: '1px', height: '5vh', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1vw', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8vh' }}>Domain</div>
            <div style={{ fontSize: '1.4vw', fontWeight: 700, color: '#7C6BF0' }}>Information Security</div>
          </div>
          <div style={{ width: '1px', height: '5vh', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1vw', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8vh' }}>Year</div>
            <div style={{ fontSize: '1.4vw', fontWeight: 700 }}>2026</div>
          </div>
        </div>
      </div>

      {/* College logo at bottom */}
      <div style={{ position: 'absolute', bottom: '5vh', zIndex: 10, padding: '1.2vh 2.5vw', backgroundColor: '#FFFFFF', borderRadius: '0.6vw', display: 'inline-flex', alignItems: 'center' }}>
        <img src={collegeLogo} crossOrigin="anonymous" alt="East Point College of Engineering & Technology" style={{ height: '5vh', objectFit: 'contain' }} />
      </div>
    </div>
  );
}
