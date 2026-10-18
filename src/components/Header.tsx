import React from 'react';
import type { Theme } from '../hooks';

interface HeaderProps {
  muted: boolean;
  onToggleMute: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/**
 * Header — Studio navigation with 3-column balanced grid, perfectly centering
 * the brand descriptor while keeping controls symmetrically positioned.
 */
const Header: React.FC<HeaderProps> = ({
  muted,
  onToggleMute,
  theme,
  onToggleTheme,
}) => {
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

        {/* Right: Mode, Theme & Sound Toggle */}
        <div className="header-right-col">
          <span className="creative-mode-tag">MODE / 001</span>

          <button
            className="theme-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'} (click to toggle)`}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span className="theme-btn-label">{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
          </button>

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
