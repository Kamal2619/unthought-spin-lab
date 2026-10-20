import React, { useCallback, useRef, useState, useEffect } from 'react';
import Wheel from './Wheel';
import TopResultBanner from './TopResultBanner';
import { useWheelAnimation } from '../hooks/useWheelAnimation';
import { brands, products } from '../data';

interface SpinControllerProps {
  playTick: (intensity: number) => void;
  playStop: () => void;
  ensureContext: () => AudioContext | null;
}

interface CombinationRecord {
  brandIndex: number;
  productIndex: number;
}

/**
 * SpinController — Streamlined, ultra-clean master coordinator.
 * Keeps exclusively the top result display, the dual wheels, and the spin button.
 */
const SpinController: React.FC<SpinControllerProps> = ({
  playTick,
  playStop,
  ensureContext,
}) => {
  const spinIndexRef = useRef<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Stop state synchronization
  const [brandFinished, setBrandFinished] = useState(false);
  const [productFinished, setProductFinished] = useState(false);

  // Wheel 01 — Brands
  const brandWheel = useWheelAnimation({
    segmentCount: brands.length,
    onSegmentPass: (intensity) => playTick(intensity),
    onStop: () => {
      playStop();
      setBrandFinished(true);
    },
  });

  // Wheel 02 — Products
  const productWheel = useWheelAnimation({
    segmentCount: products.length,
    onSegmentPass: (intensity) => playTick(intensity),
    onStop: () => {
      playStop();
      setProductFinished(true);
    },
  });

  const isSpinning = brandWheel.isSpinning || productWheel.isSpinning;

  /**
   * Deterministic pairing progression.
   * Cycles naturally in sets of 5, resetting to 1 on each page refresh.
   */
  const pickNextPair = useCallback((): CombinationRecord => {
    const LANDING_SEQUENCE = [
      { brand: 'Rolex', product: 'Pen' },
      { brand: 'Louis Vuitton', product: 'Cigarettes' },
      { brand: 'IKEA', product: 'Playing Cards' },
      { brand: 'LEGO', product: 'Lighter' },
      { brand: 'Nintendo', product: 'Umbrella' },
    ];

    const currentStep = spinIndexRef.current;
    spinIndexRef.current += 1;

    const target = LANDING_SEQUENCE[currentStep % LANDING_SEQUENCE.length];

    // Case-insensitive flexible resolution to map robustly to index
    const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetBrandNorm = norm(target.brand);
    const targetProdNorm = norm(target.product);

    let bIdx = brands.findIndex((b) => {
      const bNorm = norm(b);
      return bNorm === targetBrandNorm || (targetBrandNorm === 'lv' && bNorm.includes('louisvuitton'));
    });
    if (bIdx === -1) bIdx = 0;

    let pIdx = products.findIndex((p) => {
      const pNorm = norm(p);
      return pNorm === targetProdNorm || pNorm.startsWith(targetProdNorm) || targetProdNorm.startsWith(pNorm);
    });
    if (pIdx === -1) pIdx = 0;

    return { brandIndex: bIdx, productIndex: pIdx };
  }, []);

  /**
   * Shared SPIN trigger with natural momentum variance.
   */
  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    // Unlock Web Audio context on user gesture
    ensureContext();

    setBrandFinished(false);
    setProductFinished(false);

    // Pick selections before starting animation
    const { brandIndex, productIndex } = pickNextPair();

    setSelectedBrand(brands[brandIndex]);
    setSelectedProduct(products[productIndex]);

    // Brand wheel: 3.7s - 4.1s, with 5 to 6 revolutions for organic natural feel
    const brandRevs = 5 + (Math.random() > 0.45 ? 1 : 0);
    const brandDuration = 3750 + Math.random() * 400;
    brandWheel.startSpin(brandIndex, brandDuration, brandRevs);

    // Product wheel: stops naturally ~450ms-750ms after Brand for realistic independent deceleration
    const productRevs = 6 + (Math.random() > 0.45 ? 1 : 0);
    const productDuration = brandDuration + 480 + Math.random() * 320;
    productWheel.startSpin(productIndex, productDuration, productRevs);
  }, [isSpinning, ensureContext, pickNextPair, brandWheel, productWheel]);

  // Keyboard shortcut: Spacebar trigger
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      e.preventDefault();
      handleSpin();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSpin]);

  return (
    <div className="spin-experience">
      {/* 1. Clean Stylish Result Marquee (Directly on top of the wheels) */}
      <TopResultBanner
        brand={selectedBrand}
        product={selectedProduct}
        brandFinished={brandFinished}
        productFinished={productFinished}
        isSpinning={isSpinning}
      />

      {/* 2. Centralized Dual Wheel Stage */}
      <section className="spin-stage" aria-label="Interactive Dual Wheels">
        {/* Wheel 01: Brand */}
        <div className="wheel-column">
          <div className="wheel-header">
            <span className="wheel-index">01</span>
            <span className="wheel-divider">/</span>
            <span className="wheel-title">BRAND</span>
            <span className="wheel-count-pill">{brands.length}</span>
          </div>
          <Wheel
            items={brands}
            rotationAngle={brandWheel.currentAngle}
            size={380}
            variant="brand"
          />
        </div>

        {/* Central Kinetic Connector */}
        <div className="wheels-center-connector" aria-hidden="true">
          <div className="connector-line" />
          <div className="connector-cross">×</div>
          <div className="connector-line" />
        </div>

        {/* Wheel 02: Product */}
        <div className="wheel-column">
          <div className="wheel-header">
            <span className="wheel-index">02</span>
            <span className="wheel-divider">/</span>
            <span className="wheel-title">PRODUCT</span>
            <span className="wheel-count-pill">{products.length}</span>
          </div>
          <Wheel
            items={products}
            rotationAngle={productWheel.currentAngle}
            size={380}
            variant="product"
          />
        </div>
      </section>

      {/* 3. Centralized Action Area */}
      <div className="spin-action-area">
        <button
          className={`spin-btn ${isSpinning ? 'spinning' : ''}`}
          onClick={handleSpin}
          disabled={isSpinning}
          id="spin-button"
          aria-label={isSpinning ? 'Spinning wheels' : 'Spin both wheels'}
        >
          <span className="spin-btn-text">
            {isSpinning ? 'SPINNING…' : 'SPIN BOTH ↗'}
          </span>
          <span className="spin-btn-shortcut">SPACE</span>
        </button>
      </div>
    </div>
  );
};

export default SpinController;
