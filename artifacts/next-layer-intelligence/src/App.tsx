import { useEffect, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4';

const menuItems = ['About', 'Features', 'FAQ', 'Contact'];

function BrandMark() {
  return (
    <svg viewBox="0 0 31.5 48.5" role="img" aria-label="The Next Layer mark">
      <defs>
        <linearGradient id="brand-gradient" x1="8" y1="0" x2="34.1" y2="28.9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9e9e9e" />
          <stop offset=".28" stopColor="#a6a6a6" />
          <stop offset=".34" stopColor="#a3a3a3" />
          <stop offset=".4" stopColor="#3a3a3a" />
          <stop offset=".55" stopColor="#414141" />
          <stop offset=".6" stopColor="#7a7a7a" />
          <stop offset=".68" stopColor="#8e8e8e" />
          <stop offset=".8" stopColor="#a9a9a9" />
          <stop offset=".95" stopColor="#c4c4c4" />
          <stop offset="1" stopColor="#cccccc" />
        </linearGradient>
      </defs>
      <path
        d="M21.5 0v19.5h10v9.5L10 48.5v-20H.5v-10L21.5 0Z"
        fill="url(#brand-gradient)"
      />
      <rect x=".5" y="18.5" width="9" height="10" fill="#fdfdfd" />
      <rect x="22" y="19.5" width="9.5" height="9.5" fill="#fdfdfd" />
    </svg>
  );
}

function PartnerMarks() {
  return (
    <div className="logos" aria-label="Trusted by teams building with intelligence">
      <div className="lg lg1" data-testid="partner-logo-1">
        <svg viewBox="0 0 30 31" aria-hidden="true">
          <defs>
            <mask id="partner-cutout">
              <rect width="30" height="31" fill="white" />
              <circle cx="19.5" cy="10.5" r="5.1" fill="black" />
            </mask>
          </defs>
          <path
            fill="currentColor"
            fillRule="evenodd"
            mask="url(#partner-cutout)"
            d="M3 3h24v25H3V3Zm3 3v19h15.6a8.1 8.1 0 0 0 0-16.2H6V6Zm15.6 5.8a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Z"
          />
        </svg>
        <span className="lg-word">logoipsum</span>
      </div>
      <div className="lg lg2" data-testid="partner-logo-2">
        <svg viewBox="0 0 25 30" aria-hidden="true">
          <path fill="currentColor" d="M5 0h7v30H5z" />
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M17.5 4.2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 3.1a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Z"
          />
          <path fill="currentColor" d="M17.5 11.7a4.4 4.4 0 0 1 0 8.8 4.4 4.4 0 0 1 0-8.8Z" />
        </svg>
        <span className="lg-word">
          logoipsum<span className="lg-dot" aria-hidden="true" />
        </span>
      </div>
      <div className="lg lg3" data-testid="partner-logo-3">
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="12.35" fill="none" stroke="currentColor" strokeWidth="3.1" />
          <path d="M8 10c3.5-3.2 9.2-3 12.1.7M7.8 18c3.4 3.3 9 3.2 12.2-.4" fill="none" stroke="currentColor" strokeWidth="3.1" strokeLinecap="round" />
          <path d="M11.5 8.2c-1.4 2.1-1.4 4.1.1 5.8 1.5 1.7 1.5 3.7.1 5.8" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
        <span className="lg-word">logoipsum</span>
      </div>
      <div className="lg lg4" data-testid="partner-logo-4">
        <svg viewBox="0 0 28 25.5" aria-hidden="true">
          <path fill="currentColor" d="M1 15.4c3.4-4.8 6.5-7.1 10.2-7.1 4.5 0 6.1 3.7 8.9 3.7 2.2 0 4.3-1.8 6.9-5.5v9.1c-2.9 2.8-5.6 4.2-8.2 4.2-4.1 0-6.1-3.3-9.3-3.3-2.1 0-4.8 1.2-8.5 3.6V15.4Z" />
          <path d="M2 21c3.4-2.1 6.2-3.1 8.5-3.1 3.8 0 5.8 3.2 9.2 3.2 2.4 0 4.4-1 6.3-3" fill="none" stroke="currentColor" strokeWidth="3.05" strokeLinecap="round" />
          <path d="M2 24c3.3-1.8 6-2.7 8.2-2.7 3.5 0 5.6 2.6 9.1 2.6 2.2 0 4.1-.6 6.1-1.9" fill="none" stroke="currentColor" strokeWidth="3.05" strokeLinecap="round" />
        </svg>
        <span className="lg-word">logoipsum</span>
      </div>
    </div>
  );
}

function App() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const closeOnLandscape = () => {
      if (window.innerWidth / window.innerHeight > 1.1) setIsOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnLandscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnLandscape);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className={`stage${isOpen ? ' is-open' : ''}`} id="top">
      <div className="plate" aria-hidden="true">
        <video className="plate-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Home" data-testid="link-home">
          <BrandMark />
        </a>
        <nav className="links" aria-label="Primary navigation">
          {menuItems.map((item) => (
            <a href="#top" key={item} data-testid={`link-nav-${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </nav>
        <a className="pill pill-nav" href="mailto:hello@nextlayer.ai" data-testid="link-nav-get-started">
          <span>Get Started</span>
        </a>
        <button
          className="burger"
          id="burger"
          type="button"
          aria-controls="menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen((open) => !open)}
          data-testid="button-menu"
        >
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </button>
      </header>

      <nav className="menu" id="menu" aria-label="Mobile navigation" aria-hidden={!isOpen}>
        <div className="menu-inner">
          <p className="menu-eyebrow">Menu</p>
          <ul className="menu-list">
            {menuItems.map((item) => (
              <li key={item}>
                <a href="#top" onClick={closeMenu} data-testid={`link-menu-${item.toLowerCase()}`}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu-foot">
            <a className="pill" href="mailto:hello@nextlayer.ai" onClick={closeMenu} data-testid="link-menu-get-started">
              <span>Get Started</span>
            </a>
            <a className="ghost" href="#top" onClick={closeMenu} data-testid="link-menu-architecture">
              View Architecture
            </a>
          </div>
        </div>
      </nav>

      <main className="hero" aria-labelledby="hero-title">
        <h1 className="headline" id="hero-title" data-testid="text-headline">
          <span>The Next Layer</span>
          <span>of Intelligence</span>
        </h1>
        <p className="sub" data-testid="text-subcopy">
          <span>A unified infrastructure platform to help teams build,</span>
          <span>ship, and scale AI systems with confidence.</span>
        </p>
        <div className="actions">
          <a className="pill pill-cta" href="mailto:hello@nextlayer.ai" data-testid="link-hero-get-started">
            <span>Get Started</span>
          </a>
          <a className="ghost" href="#top" data-testid="link-hero-architecture">
            View Architecture
          </a>
        </div>
      </main>

      <PartnerMarks />
    </div>
  );
}

export default App;
