import React from 'react';

interface TopResultBannerProps {
  brand: string | null;
  product: string | null;
  brandFinished: boolean;
  productFinished: boolean;
  isSpinning: boolean;
}

/**
 * TopResultBanner — Pure, clean, stylish typographic result showcase.
 * Removes all clutter and unnecessary text, keeping exclusively:
 * BRAND × PRODUCT (e.g. APPLE × TOOTHBRUSH)
 */
const TopResultBanner: React.FC<TopResultBannerProps> = ({
  brand,
  product,
  brandFinished,
  productFinished,
  isSpinning,
}) => {
  const isComplete = brandFinished && productFinished && !isSpinning && Boolean(brand && product);

  return (
    <div
      className={`top-result-marquee ${isComplete ? 'is-complete' : isSpinning ? 'is-spinning' : 'is-idle'}`}
      aria-live="polite"
      aria-label="Result selection"
    >
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
    </div>
  );
};

export default React.memo(TopResultBanner);
