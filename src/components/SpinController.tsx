import React, { useCallback, useRef, useState, useEffect } from 'react';
import Wheel from './Wheel';
import ResultPanel from './ResultPanel';
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
 * SpinController — Master coordinator for the centralized Brand × Product spin lab.
 */
const SpinController: React.FC<SpinControllerProps> = ({
  playTick,
  playStop,
  ensureContext,
}) => {
  const historyRef = useRef<CombinationRecord[]>([]);
  const [conceptCount, setConceptCount] = useState<number>(0);
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
  const bothStopped = brandFinished && productFinished && !isSpinning;

  /**
   * Deterministic unique pair selection.
   * Avoids consecutive duplicates, and gracefully cycles across 800 combinations.
   */
  const pickNextPair = useCallback((): CombinationRecord => {
    const totalPossible = brands.length * products.length; // 800
    if (historyRef.current.length >= totalPossible) {
      historyRef.current = [];
    }

    const last = historyRef.current[historyRef.current.length - 1];

    let bIdx: number;
    let pIdx: number;
    let attempts = 0;

    do {
      bIdx = Math.floor(Math.random() * brands.length);
      pIdx = Math.floor(Math.random() * products.length);
      attempts++;
    } while (
      attempts < 100 &&
      last &&
      last.brandIndex === bIdx &&
      last.productIndex === pIdx
    );

    const record = { brandIndex: bIdx, productIndex: pIdx };
    historyRef.current.push(record);
    return record;
  }, []);

  /**
   * Shared SPIN trigger.
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
    setConceptCount((prev) => prev + 1);

    // Brand wheel: 3.8s, 5 full revolutions
    const brandDuration = 3800 + Math.random() * 250;
    const brandRevs = 5;
    brandWheel.startSpin(brandIndex, brandDuration, brandRevs);

    // Product wheel: 4.4s, 6 full revolutions (stops ~500ms after Brand for dynamic cadence)
    const productDuration = 4400 + Math.random() * 250;
    const productRevs = 6;
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
      {/* Centralized Dual Wheel Stage */}
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

      {/* Centralized Action Area */}
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
        <p className="spin-caption">TWO VARIABLES. ONE NEW IDEA.</p>
      </div>

      {/* Centralized Result Reveal */}
      <ResultPanel
        brand={bothStopped ? selectedBrand : null}
        product={bothStopped ? selectedProduct : null}
        isSpinning={isSpinning}
        conceptNumber={conceptCount}
      />
    </div>
  );
};

export default SpinController;
