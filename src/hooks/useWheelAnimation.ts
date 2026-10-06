import { useCallback, useRef, useState, useEffect } from 'react';

export interface WheelAnimationState {
  /** Current rotation angle in degrees (cumulative, positive = clockwise) */
  currentAngle: number;
  /** Whether the wheel is currently animating */
  isSpinning: boolean;
  /** Index of the selected segment after spin completes */
  selectedIndex: number | null;
}

interface AnimationConfig {
  /** Number of segments on this wheel */
  segmentCount: number;
  /** Callback fired each time a segment boundary passes the pointer */
  onSegmentPass?: (intensity: number) => void;
  /** Callback fired when the wheel stops */
  onStop?: () => void;
}

/**
 * useWheelAnimation — requestAnimationFrame-based wheel spin with realistic physics.
 *
 * Mathematical model:
 *   - The wheel rotates CLOCKWISE (positive angles in SVG rotate(θ, cx, cy)).
 *   - The pointer is fixed at 12 o'clock (0° / top).
 *   - Segment i spans [i * segmentAngle, (i + 1) * segmentAngle] in wheel space.
 *   - Segment i's center is at (i + 0.5) * segmentAngle clockwise from top.
 *   - When the wheel is rotated clockwise by angle θ:
 *     A point initially at midDeg clockwise from top is now at (midDeg + θ) from top.
 *     For this segment center to align with the pointer at 0° (top):
 *     midDeg + θ ≡ 0 (mod 360)  =>  θ ≡ -midDeg ≡ (360 - midDeg % 360) (mod 360).
 *   - This aligns the winning segment with the pointer.
 */
export function useWheelAnimation(config: AnimationConfig) {
  const { segmentCount, onSegmentPass, onStop } = config;

  const [state, setState] = useState<WheelAnimationState>({
    currentAngle: 0,
    isSpinning: false,
    selectedIndex: null,
  });

  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastBoundaryRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);

  const segmentAngle = 360 / segmentCount;

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /**
   * Quintic ease-out: rapid acceleration / high initial speed, long graceful deceleration.
   * f(t) = 1 - (1 - t)^5
   */
  const easeOutQuint = (t: number): number => {
    return 1 - Math.pow(1 - t, 5);
  };

  /**
   * Start the spin animation.
   * @param targetIndex - The pre-selected winning segment index.
   * @param duration - Total animation duration in ms.
   * @param extraRevolutions - Number of full extra revolutions (typically 4-7).
   */
  const startSpin = useCallback(
    (targetIndex: number, duration: number, extraRevolutions: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      const startAngle = angleRef.current;

      // 1. Center of winning segment in wheel coordinates (clockwise from top)
      const segmentCenter = (targetIndex + 0.5) * segmentAngle;

      // 2. Modulo target angle where segmentCenter lands exactly at top (0°)
      const targetModulo = (360 - (segmentCenter % 360)) % 360;

      // 3. Current modulo angle
      const currentModulo = ((startAngle % 360) + 360) % 360;

      // 4. Forward (clockwise) rotation delta to reach targetModulo
      let delta = (targetModulo - currentModulo) % 360;
      if (delta <= 0) delta += 360;

      // 5. Total rotation = delta + extra full revolutions
      const totalRotation = delta + extraRevolutions * 360;
      const endAngle = startAngle + totalRotation;

      // Check for user preference for reduced motion
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const effectiveDuration = prefersReducedMotion ? Math.min(duration, 1500) : duration;

      lastBoundaryRef.current = Math.floor(startAngle / segmentAngle);
      lastTickTimeRef.current = 0;

      setState({
        currentAngle: startAngle,
        isSpinning: true,
        selectedIndex: null,
      });

      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / effectiveDuration, 1);
        const easedProgress = easeOutQuint(progress);

        const currentAngle = startAngle + totalRotation * easedProgress;
        angleRef.current = currentAngle;

        // Sound trigger: track segment boundary crossings
        const currentBoundary = Math.floor(currentAngle / segmentAngle);
        if (currentBoundary !== lastBoundaryRef.current) {
          // Limit minimum tick spacing to 20ms to avoid audio clutter at peak speed
          if (now - lastTickTimeRef.current >= 20) {
            // Velocity profile from derivative of easeOutQuint: 5 * (1-t)^4
            const velocity = progress < 1 ? 5 * Math.pow(1 - progress, 4) : 0;
            const intensity = Math.max(0.2, Math.min(velocity / 4, 1));
            onSegmentPass?.(intensity);
            lastTickTimeRef.current = now;
          }
          lastBoundaryRef.current = currentBoundary;
        }

        if (progress < 1) {
          setState({
            currentAngle,
            isSpinning: true,
            selectedIndex: null,
          });
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete — snap to exact mathematically calculated target angle
          angleRef.current = endAngle;
          setState({
            currentAngle: endAngle,
            isSpinning: false,
            selectedIndex: targetIndex,
          });
          rafRef.current = null;
          onStop?.();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [segmentCount, segmentAngle, onSegmentPass, onStop],
  );

  return {
    ...state,
    startSpin,
  };
}
