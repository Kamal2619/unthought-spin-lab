import React, { useEffect, useState } from 'react';

interface ResultPanelProps {
  brand: string | null;
  product: string | null;
  isSpinning: boolean;
  conceptNumber: number;
}

/**
 * ResultPanel — Centralized, exhibition-grade typography reveal.
 *
 * Staggered reveal sequence:
 *   Stage 1 (50ms): Brand slides up & fades in
 *   Stage 2 (160ms): Vermilion '×' reveals
 *   Stage 3 (270ms): Product slides up & fades in
 *   Stage 4 (420ms): Divider & descriptor metadata fade in
 */
const ResultPanel: React.FC<ResultPanelProps> = ({
  brand,
  product,
  isSpinning,
  conceptNumber,
}) => {
  const [showBrand, setShowBrand] = useState(false);
  const [showCross, setShowCross] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const hasResult = Boolean(brand && product && !isSpinning);

  useEffect(() => {
    if (isSpinning) {
      setShowBrand(false);
      setShowCross(false);
      setShowProduct(false);
      setShowDetails(false);
      return;
    }

    if (hasResult) {
      const t1 = setTimeout(() => setShowBrand(true), 50);
      const t2 = setTimeout(() => setShowCross(true), 160);
      const t3 = setTimeout(() => setShowProduct(true), 270);
      const t4 = setTimeout(() => setShowDetails(true), 420);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [hasResult, isSpinning, brand, product]);

  return (
    <section
      className="result-panel"
      aria-live="polite"
      aria-atomic="true"
      id="result-panel"
    >
      {/* Top Metadata Header */}
      <div className="result-top-bar">
        <span className="result-eyebrow">YOUR NEXT CREATIVE CHALLENGE</span>
        {conceptNumber > 0 && (
          <span className="result-concept-tag">
            CONCEPT {String(conceptNumber).padStart(3, '0')}
          </span>
        )}
      </div>

      {/* Main Combination Showcase */}
      <div className="result-stage">
        {hasResult ? (
          <div className="result-combination">
            <span className={`result-word result-brand ${showBrand ? 'active' : ''}`}>
              {brand}
            </span>
            <span className={`result-times ${showCross ? 'active' : ''}`}>
              ×
            </span>
            <span className={`result-word result-product ${showProduct ? 'active' : ''}`}>
              {product}
            </span>
          </div>
        ) : (
          <div className="result-combination placeholder-state">
            <span className="placeholder-text">BRAND</span>
            <span className="placeholder-cross">×</span>
            <span className="placeholder-text">PRODUCT</span>
          </div>
        )}
      </div>

      {/* Bottom Accent & Subtitle */}
      <div className={`result-bottom-details ${showDetails || isSpinning ? 'visible' : ''}`}>
        <div className="result-accent-dash" />
        <p className="result-descriptor">
          {isSpinning
            ? 'Calculating unexpected trajectory…'
            : hasResult
            ? 'A new product concept awaits.'
            : 'Spin the wheels to generate a concept.'}
        </p>
      </div>
    </section>
  );
};

export default React.memo(ResultPanel);
