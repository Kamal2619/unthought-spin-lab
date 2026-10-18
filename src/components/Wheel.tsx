import React, { useMemo } from 'react';

interface WheelProps {
  /** Array of segment labels */
  items: string[];
  /** Current rotation angle in degrees (clockwise) */
  rotationAngle: number;
  /** Size in px (default 380) */
  size?: number;
  /** Variant styling */
  variant?: 'brand' | 'product';
}

/**
 * Wheel — Studio-grade segmented roulette-style spin wheel rendered in SVG.
 *
 * Engineered with:
 * - Mathematical angular sectors: 360 / N
 * - Precision radial typography along sector bisectors
 * - Fixed vermilion needle indicator at 12 o'clock with clear margin to labels
 * - Industrial concentric hub with variant branding
 * - High-contrast charcoal segments with hairline dividers
 */
const Wheel: React.FC<WheelProps> = ({
  items,
  rotationAngle,
  size = 380,
  variant = 'brand',
}) => {
  const n = items.length;
  const segmentAngle = 360 / n;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = size * 0.15; // Hub radius (~57px on 380px wheel)

  // Monochromatic palette — high contrast, ultra-refined
  const segFills =
    variant === 'brand'
      ? ['#242424', '#1B1B1B']
      : ['#262626', '#1D1D1D'];
  const separatorColor = '#3A3A3A';
  const textColor = '#F0EFEA';
  const hubColor = '#161616';
  const hubBorder = '#444444';
  const outerRimColor = '#2C2C2C';
  const pointerColor = '#F04427';

  /**
   * Build SVG annular wedge path for segment i:
   * Clockwise arc from startDeg to endDeg, with 0° at 12 o'clock (-90° standard polar).
   */
  const buildSegmentPath = (startDeg: number, endDeg: number): string => {
    const startRad = ((startDeg - 90) * Math.PI) / 180;
    const endRad = ((endDeg - 90) * Math.PI) / 180;

    const ox1 = cx + outerRadius * Math.cos(startRad);
    const oy1 = cy + outerRadius * Math.sin(startRad);
    const ox2 = cx + outerRadius * Math.cos(endRad);
    const oy2 = cy + outerRadius * Math.sin(endRad);

    const ix1 = cx + innerRadius * Math.cos(startRad);
    const iy1 = cy + innerRadius * Math.sin(startRad);
    const ix2 = cx + innerRadius * Math.cos(endRad);
    const iy2 = cy + innerRadius * Math.sin(endRad);

    const largeArc = endDeg - startDeg > 180 ? 1 : 0;

    return [
      `M ${ox1} ${oy1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');
  };

  /**
   * Precalculate geometry for all segments:
   * Labels start cleanly inside the outer rim with sufficient clearance from the pointer.
   */
  const segments = useMemo(() => {
    return items.map((label, i) => {
      const startDeg = i * segmentAngle;
      const endDeg = (i + 1) * segmentAngle;
      const midDeg = (i + 0.5) * segmentAngle;

      const path = buildSegmentPath(startDeg, endDeg);

      // Separator line coordinates
      const sepRad = ((startDeg - 90) * Math.PI) / 180;
      const sepX1 = cx + innerRadius * Math.cos(sepRad);
      const sepY1 = cy + innerRadius * Math.sin(sepRad);
      const sepX2 = cx + outerRadius * Math.cos(sepRad);
      const sepY2 = cy + outerRadius * Math.sin(sepRad);

      // Max characters to ensure zero overlap
      const maxLen = n > 20 ? 14 : 16;
      const displayLabel = label.length > maxLen ? label.slice(0, maxLen - 1) + '…' : label;

      return {
        path,
        fill: segFills[i % 2],
        label: displayLabel,
        fullLabel: label,
        midDeg,
        sepX1,
        sepY1,
        sepX2,
        sepY2,
      };
    });
  }, [items, n, segmentAngle, cx, cy, outerRadius, innerRadius]);

  // Scaled typography
  const fontSize = n > 20 ? 8 : 10;
  // Label starts 22px inside outer rim, leaving comfortable clearance below pointer tip
  const labelStartOffset = outerRadius - 22;

  return (
    <div className="wheel-container" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="wheel-svg"
        role="img"
        aria-label={`${variant === 'brand' ? 'Brands' : 'Products'} selection wheel`}
      >
        <defs>
          {/* Subtle wheel drop shadow */}
          <filter id={`wheel-shadow-${variant}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.3" />
          </filter>

          {/* Pointer shadow */}
          <filter id={`pointer-shadow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer casing shadow */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 3}
          fill="none"
          stroke={outerRimColor}
          strokeWidth="3.5"
          className="wheel-outer-casing"
          filter={`url(#wheel-shadow-${variant})`}
        />

        {/* ========================================================
            ROTATING ASSEMBLY (Spins clockwise around cx, cy)
            ======================================================== */}
        <g transform={`rotate(${rotationAngle}, ${cx}, ${cy})`}>
          {/* 1. Segment sectors */}
          {segments.map((seg, i) => (
            <path key={`wedge-${i}`} d={seg.path} fill={seg.fill} />
          ))}

          {/* 2. Precision dividers */}
          {segments.map((seg, i) => (
            <line
              key={`sep-${i}`}
              x1={seg.sepX1}
              y1={seg.sepY1}
              x2={seg.sepX2}
              y2={seg.sepY2}
              stroke={separatorColor}
              strokeWidth="1"
            />
          ))}

          {/* 3. Radial labels:
                 Each label ray is rotated to midDeg.
                 Text starts at labelStartOffset and reads toward hub.
                 dominantBaseline="central" + textAnchor="start" ensures
                 perfect radial tracking along the bisector. */}
          {segments.map((seg, i) => (
            <g
              key={`label-group-${i}`}
              transform={`rotate(${seg.midDeg}, ${cx}, ${cy})`}
            >
              <text
                x={cx}
                y={cy - labelStartOffset}
                fill={textColor}
                fontSize={fontSize}
                fontFamily="'Space Grotesk', 'Inter', sans-serif"
                fontWeight="600"
                letterSpacing="0.08em"
                textAnchor="start"
                dominantBaseline="central"
                transform={`rotate(90, ${cx}, ${cy - labelStartOffset})`}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {seg.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Perimeter concentric hairline */}
          <circle
            cx={cx}
            cy={cy}
            r={outerRadius - 2}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* Inner boundary track */}
          <circle
            cx={cx}
            cy={cy}
            r={innerRadius}
            fill="none"
            stroke="#363636"
            strokeWidth="1.5"
          />
        </g>

        {/* ========================================================
            STATIONARY ELEMENTS (Rim, Hub, & Pointer)
            ======================================================== */}

        {/* Outer machined rim bezel */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 1}
          fill="none"
          stroke={outerRimColor}
          strokeWidth="3.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 3}
          fill="none"
          stroke="#414141"
          strokeWidth="1"
        />

        {/* Center Hub Assembly */}
        {/* Hub Outer Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill={hubColor}
          stroke={hubBorder}
          strokeWidth="2"
        />
        {/* Hub Intermediate Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius * 0.72}
          fill="#1F1F1F"
          stroke="#383838"
          strokeWidth="1"
        />
        {/* Hub Inner Core */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius * 0.42}
          fill="#272727"
        />
        {/* Central Hub Label (01 or 02) */}
        <text
          x={cx}
          y={cy}
          fill="#8A8A8A"
          fontSize="9"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          letterSpacing="0.1em"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {variant === 'brand' ? '01' : '02'}
        </text>

        {/* ========================================================
            FIXED POINTER AT 12 O'CLOCK
            Precision vermilion indicator pointing directly into the winning segment.
            ======================================================== */}
        <g filter={`url(#pointer-shadow-${variant})`}>
          {/* Main Pointer Arrowhead */}
          <polygon
            points={`${cx - 9},${cy - outerRadius - 6} ${cx + 9},${cy - outerRadius - 6} ${cx},${cy - outerRadius + 12}`}
            fill={pointerColor}
            stroke="#BD3219"
            strokeWidth="1"
          />
          {/* Center Precision Ridge */}
          <line
            x1={cx}
            y1={cy - outerRadius - 5}
            x2={cx}
            y2={cy - outerRadius + 11}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1"
          />
          {/* Base Mount Rivet */}
          <circle
            cx={cx}
            cy={cy - outerRadius - 5}
            r={2}
            fill="#FFFFFF"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};

export default React.memo(Wheel);
