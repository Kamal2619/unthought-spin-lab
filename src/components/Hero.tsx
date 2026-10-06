import React from 'react';

/**
 * Hero — Compact editorial introduction.
 * Calibrated height so the wheels remain front and center in 16:9 recordings.
 */
const Hero: React.FC = () => {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-eyebrow-wrapper">
        <span className="hero-eyebrow">THE UNEXPECTED PRODUCT PROJECT</span>
      </div>
      <h1 className="hero-title" id="hero-title">
        What if brands made <span className="hero-title-italic">the unexpected?</span>
      </h1>
      <p className="hero-subtitle">
        One brand. One unlikely product. One new idea.
      </p>
    </section>
  );
};

export default React.memo(Hero);
