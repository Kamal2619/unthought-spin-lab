import React from 'react';

interface HeaderProps {
  muted: boolean;
  onToggleMute: () => void;
}

/**
 * Header — Studio navigation with 3-column balanced grid, perfectly centering
 * the brand descriptor while keeping controls symmetrically positioned.
 */
const Header: React.FC<HeaderProps> = ({ muted, onToggleMute }) => {
  return (
    <header className="site-header">
      <div className="header-container">
        {/* Left: Brand Identity */}
        <div className="header-left-col">
          <div className="brand-wordmark-group">
            <span className="brand-wordmark">UNTHOUGHT</span>
            <span className="brand-accent-dot" aria-hidden="true" />
          </div>
          <span className="brand-subtext">SPIN LAB</span>
        </div>

        {/* Center: System Descriptor (Dead-Center) */}
        <div className="header-center-col">
          <span className="header-descriptor-pill">BRAND × PRODUCT GENERATOR</span>
        </div>

        {/* Right: Mode & Sound Toggle */}
        <div className="header-right-col">
          <span className="creative-mode-tag">MODE / 001</span>
          <button
            className={`sound-btn ${muted ? 'is-muted' : 'is-active'}`}
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title={muted ? 'Sound: Muted' : 'Sound: Active'}
            id="sound-toggle-btn"
          >
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
            <span className="sound-btn-label">{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
          </button>
        </div>
      </div>
      <div className="header-hairline" />
    </header>
  );
};

export default React.memo(Header);
