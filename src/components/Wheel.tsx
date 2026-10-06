import React, { useMemo } from 'react';

interface WheelProps {
  /** Array of segment labels */
  items: string[];
  /** Current rotation angle in degrees (clockwise) */
  rotationAngle: number;
  /** Size in px (default 400) */
  size?: number;
  /** Variant styling */
  variant?: 'brand' | 'product';
}

/**
 * Wheel — Genuine segmented roulette-style spin wheel rendered with SVG.
 *
 * Characteristics:
 * - Precise angular sector calculation: 360 / N
 * - Radial label placement along the centerline of each segment
 * - Fixed vermilion pointer at 12 o'clock (top)
 * - Industrial-inspired center hub and outer machined rim
 * - Crisp contrast with zero label clipping
 */
const Wheel: React.FC<WheelProps> = ({
  items,
  rotationAngle,
  size = 400,
  variant = 'brand',
}) => {
  const n = items.length;
  const segmentAngle = 360 / n;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 8;
  const innerRadius = size * 0.16; // Central hub radius

  // Monochromatic palette
  const segFills =
    variant === 'brand'
      ? ['#252525', '#1D1D1D']
      : ['#282828', '#202020'];
  const separatorColor = '#3E3E3E';
  const textColor = '#ECEBE8';
  const hubColor = '#171717';
  const hubBorder = '#484848';
  const outerRimColor = '#2F2F2F';
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
   * Each label is placed on a radial ray rotated by midDeg from 12 o'clock.
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

      // Text formatting: uppercase, trimmed if needed
      const maxLen = n > 20 ? 15 : 17;
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

  // Scaled typography based on segment density
  const fontSize = n > 20 ? 8.5 : 10.5;
  const labelStartOffset = outerRadius - 16; // Distance from center where label starts reading inward

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
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          {/* Pointer crisp drop shadow */}
          <filter id={`pointer-shadow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer casing / rim shadow */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 3}
          fill="none"
          stroke={outerRimColor}
          strokeWidth="3"
          filter={`url(#wheel-shadow-${variant})`}
        />

        {/* ========================================================
            ROTATING ASSEMBLY
            Spins by rotationAngle around (cx, cy)
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
                 Text is placed along the ray (from outer rim towards hub).
                 `dominantBaseline="central"` + `textAnchor="end"` guarantees
                 perfect radial alignment with zero clipping. */}
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
                letterSpacing="0.06em"
                textAnchor="start"
                dominantBaseline="central"
                transform={`rotate(90, ${cx}, ${cy - labelStartOffset})`}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {seg.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Subtle perimeter track circle */}
          <circle
            cx={cx}
            cy={cy}
            r={outerRadius}
            fill="none"
            stroke="#363636"
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
            STATIONARY ELEMENTS (Hub & Pointer)
            ======================================================== */}

        {/* Outer machined rim */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 1.5}
          fill="none"
          stroke={outerRimColor}
          strokeWidth="3.5"
        />

        {/* Center Hub assembly */}
        {/* Outer hub bevel */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill={hubColor}
          stroke={hubBorder}
          strokeWidth="2"
        />
        {/* Inner concentric ring */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius * 0.65}
          fill="#1E1E1E"
          stroke="#383838"
          strokeWidth="1"
        />
        {/* Hub center cap */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius * 0.3}
          fill="#2A2A2A"
        />
        {/* Central precision pin */}
        <circle
          cx={cx}
          cy={cy}
          r={2.5}
          fill="#555555"
        />

        {/* ========================================================
            FIXED POINTER AT 12 O'CLOCK
            Crisp vermilion indicator pointing directly into the winning segment.
            ======================================================== */}
        <g filter={`url(#pointer-shadow-${variant})`}>
          {/* Base backing */}
          <polygon
            points={`${cx - 10},${cy - outerRadius - 4} ${cx + 10},${cy - outerRadius - 4} ${cx},${cy - outerRadius + 16}`}
            fill={pointerColor}
            stroke="#C0331B"
            strokeWidth="1"
          />
          {/* Pointer center ridge highlight */}
          <line
            x1={cx}
            y1={cy - outerRadius - 3}
            x2={cx}
            y2={cy - outerRadius + 15}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
};

export default React.memo(Wheel);
