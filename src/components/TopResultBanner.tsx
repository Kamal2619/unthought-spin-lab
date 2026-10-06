import React from 'react';

interface TopResultBannerProps {
  brand: string | null;
  product: string | null;
  brandFinished: boolean;
  productFinished: boolean;
  isSpinning: boolean;
  conceptNumber: number;
}

/**
 * TopResultBanner — Prominent live result display positioned directly above the spin wheels.
 *
 * Shows the combination in clean, neat, stylish editorial typography:
 *   e.g. "APPLE × TOOTHBRUSH"
 *
 * Features progressive lock-in:
 *   - When Wheel 01 stops: Brand locks in immediately
 *   - When Wheel 02 stops: Product locks in with final clunk
 *   - Complete pairing is prominently framed for Instagram Reels
 */
const TopResultBanner: React.FC<TopResultBannerProps> = ({
  brand,
  product,
  brandFinished,
  productFinished,
  isSpinning,
  conceptNumber,
}) => {
  const isComplete = brandFinished && productFinished && !isSpinning && Boolean(brand && product);

  return (
    <div
      className={`top-result-marquee ${isComplete ? 'is-complete' : isSpinning ? 'is-spinning' : 'is-idle'}`}
      aria-live="polite"
      aria-label="Current Brand and Product selection"
    >
      {/* Top micro metadata header */}
      <div className="marquee-meta-bar">
        <div className="marquee-status-pill">
          <span className="marquee-pulse-dot" />
          <span className="marquee-status-text">
            {isSpinning
              ? !brandFinished && !productFinished
                ? 'SPINNING DUAL WHEELS…'
                : brandFinished && !productFinished
                ? 'BRAND LOCKED — PRODUCT SPINNING…'
                : 'DECELERATING…'
              : isComplete
              ? 'CONCEPT SELECTION'
              : 'LIVE RESULT PREVIEW'}
          </span>
        </div>

        {conceptNumber > 0 && (
          <span className="marquee-concept-counter">
            PAIRING #{String(conceptNumber).padStart(3, '0')}
          </span>
        )}
      </div>

      {/* Main Hero Combination Headline */}
      <div className="marquee-headline-wrap">
        {isComplete ? (
          <div className="marquee-combination animate-reveal">
            <span className="marquee-brand">{brand}</span>
            <span className="marquee-cross">×</span>
            <span className="marquee-product">{product}</span>
          </div>
        ) : isSpinning ? (
          <div className="marquee-combination is-live-calculating">
            <span className={`marquee-brand ${brandFinished ? 'locked' : 'pending'}`}>
              {brandFinished && brand ? brand : '···'}
            </span>
            <span className="marquee-cross">×</span>
            <span className={`marquee-product ${productFinished ? 'locked' : 'pending'}`}>
              {productFinished && product ? product : '···'}
            </span>
          </div>
        ) : (
          <div className="marquee-combination is-placeholder">
            <span className="marquee-placeholder-text">BRAND</span>
            <span className="marquee-placeholder-cross">×</span>
            <span className="marquee-placeholder-text">PRODUCT</span>
          </div>
        )}
      </div>

      <div className="marquee-subline">
        {isComplete
          ? 'THE UNEXPECTED COMBINATION'
          : isSpinning
          ? 'SYNCHRONIZING ROTATIONAL MOMENTUM'
          : 'PRESS SPIN TO GENERATE PAIRING'}
      </div>
    </div>
  );
};

export default React.memo(TopResultBanner);
