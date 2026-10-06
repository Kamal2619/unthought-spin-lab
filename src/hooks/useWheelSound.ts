import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * useWheelSound — Web Audio API mechanical sound synthesizer.
 *
 * Implements:
 *   1. Precise mechanical flapper tick (transient click + damped metallic pin resonance)
 *   2. Satisfying stop click/thump (dual frequency mechanical impact)
 *   3. Audio context auto-resuming on user interaction
 *   4. Clean mute/unmute handling and session persistence
 */
export function useWheelSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('unthought_sound_muted') === 'true';
    } catch {
      return false;
    }
  });
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
    try {
      localStorage.setItem('unthought_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }, [muted]);

  /** Lazily initialize AudioContext after user gesture */
  const ensureContext = useCallback((): AudioContext | null => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctxRef.current) {
        ctxRef.current = new AudioCtx();
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /**
   * Mechanical tick: Short high-frequency snap with subtle wood/metal transient.
   * `intensity` scales pitch variation and volume dynamically with wheel angular speed.
   */
  const playTick = useCallback(
    (intensity: number = 0.5) => {
      if (mutedRef.current) return;
      const ctx = ensureContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. High transient burst (the pin strike)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      // Pitch shifts slightly with speed
      const baseFreq = 2200 + Math.random() * 300 + intensity * 400;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      const gain = ctx.createGain();
      const peakVol = 0.045 * Math.max(0.3, Math.min(intensity, 1));
      gain.gain.setValueAtTime(peakVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);

      // 2. Micro metallic ring (subtle ping)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(3200 + (Math.random() - 0.5) * 200, now);
      subOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.015);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(peakVol * 0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.02);
    },
    [ensureContext],
  );

  /**
   * Final stop sound: authoritative mechanical detent latch / damped click.
   */
  const playStop = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Body impact (low-mid mechanical thunk)
    const thud = ctx.createOscillator();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(180, now);
    thud.frequency.exponentialRampToValueAtTime(55, now + 0.14);

    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.12, now);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.16);

    // Mechanical latch click
    const click = ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(1400, now);
    click.frequency.exponentialRampToValueAtTime(350, now + 0.04);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(500, now);

    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);

    click.start(now);
    click.stop(now + 0.06);
  }, [ensureContext]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return {
    muted,
    toggleMute,
    playTick,
    playStop,
    ensureContext,
  };
}
