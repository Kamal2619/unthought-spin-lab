import React, { useEffect, useState } from 'react';

interface ResultPanelProps {
  brand: string | null;
  product: string | null;
  isSpinning: boolean;
  conceptNumber: number;
}

/**
 * ResultPanel — Clean, cinematic editorial reveal for the Brand × Product combination.
 *
 * Sequence when both wheels finish:
 *   Stage 1 (60ms): Brand reveals
 *   Stage 2 (180ms): Vermilion '×' reveals
 *   Stage 3 (300ms): Product reveals
 *   Stage 4 (450ms): Divider and metadata descriptor fade in
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
      // Rapid, punchy staggered reveal (entire reveal completes in under 500ms)
      const t1 = setTimeout(() => setShowBrand(true), 60);
      const t2 = setTimeout(() => setShowCross(true), 180);
      const t3 = setTimeout(() => setShowProduct(true), 300);
      const t4 = setTimeout(() => setShowDetails(true), 450);

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
      <div className="result-header">
        <p className="result-eyebrow">YOUR NEXT CREATIVE CHALLENGE</p>
        {conceptNumber > 0 && (
          <span className="result-badge">
            CONCEPT {String(conceptNumber).padStart(3, '0')}
          </span>
        )}
      </div>

      <div className="result-display-wrapper">
        {hasResult ? (
          <div className="result-combination">
            <span className={`result-token result-brand ${showBrand ? 'active' : ''}`}>
              {brand}
            </span>
            <span className={`result-cross ${showCross ? 'active' : ''}`}>
              ×
            </span>
            <span className={`result-token result-product ${showProduct ? 'active' : ''}`}>
              {product}
            </span>
          </div>
        ) : (
          <div className="result-combination placeholder-mode">
            <span className="result-placeholder">BRAND</span>
            <span className="result-placeholder-cross">×</span>
            <span className="result-placeholder">PRODUCT</span>
          </div>
        )}
      </div>

      <div className={`result-footer ${showDetails || isSpinning ? 'visible' : ''}`}>
        <div className="result-accent-bar" />
        <p className="result-descriptor">
          {isSpinning
            ? 'Calculating unexpected trajectory...'
            : hasResult
            ? 'A new product concept awaits.'
            : 'One brand. One unlikely product. One new idea.'}
        </p>
      </div>
    </section>
  );
};

export default React.memo(ResultPanel);
