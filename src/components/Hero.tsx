import React from 'react';

/**
 * Hero — Editorial title section with centralized typography.
 * Proportionally calibrated so the dual wheels remain front and center
 * in the first viewport for screen recordings.
 */
const Hero: React.FC = () => {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-eyebrow-container">
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
