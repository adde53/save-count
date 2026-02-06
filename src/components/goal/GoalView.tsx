import { useCallback, useRef } from 'react';
import { SportType } from '@/lib/sportConfig';
import { ShotEvent, ShotOutcome, OUTCOME_CONFIG } from '@/lib/shotTypes';
import { getGoalDimension } from '@/lib/goalDimensions';

interface GoalViewProps {
  sport: SportType;
  shots: ShotEvent[];
  onTapGoal?: (x: number, y: number) => void;
  interactive?: boolean;
  className?: string;
}

export default function GoalView({ sport, shots, onTapGoal, interactive = true, className = '' }: GoalViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dim = getGoalDimension(sport);

  // We use a normalized coordinate system.
  // The goal area is from (10, 10) to (90, 80) within a 100x100 viewBox.
  // Outside area (for off_target) is the surrounding margin.
  const goalLeft = 10;
  const goalTop = 10;
  const goalWidth = 80;
  const goalHeight = 70;

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!interactive || !onTapGoal || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Convert to 0-1 coordinates relative to the whole SVG
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    onTapGoal(x, y);
  }, [interactive, onTapGoal]);

  const getMarkerColor = (outcome: ShotOutcome) => OUTCOME_CONFIG[outcome].color;

  const getMarkerPosition = (shot: ShotEvent) => {
    if (shot.positionX == null || shot.positionY == null) return null;
    // Map 0-1 to viewBox coordinates
    const cx = shot.positionX * 100;
    const cy = shot.positionY * 100;
    return { cx, cy };
  };

  return (
    <div className={`w-full ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 90"
        className={`w-full h-auto ${interactive ? 'cursor-crosshair' : ''}`}
        onClick={handleClick}
        style={{ maxHeight: '60vh' }}
      >
        {/* Background / pitch area */}
        <rect x="0" y="0" width="100" height="90" rx="2" fill="hsl(142, 40%, 25%)" />

        {/* Goal net pattern */}
        <defs>
          <pattern id="net" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 4 4 M 4 0 L 0 4" stroke="hsl(0, 0%, 80%)" strokeWidth="0.15" opacity="0.4" />
          </pattern>
        </defs>
        <rect x={goalLeft} y={goalTop} width={goalWidth} height={goalHeight} fill="url(#net)" rx="1" />
        <rect x={goalLeft} y={goalTop} width={goalWidth} height={goalHeight} fill="hsl(0, 0%, 100%)" opacity="0.08" rx="1" />

        {/* Goal frame - posts and crossbar */}
        <rect x={goalLeft} y={goalTop} width={goalWidth} height={goalHeight} fill="none" stroke="hsl(0, 0%, 95%)" strokeWidth="2" rx="1" />

        {/* Post highlights */}
        <line x1={goalLeft} y1={goalTop} x2={goalLeft} y2={goalTop + goalHeight} stroke="hsl(0, 0%, 100%)" strokeWidth="2.5" />
        <line x1={goalLeft + goalWidth} y1={goalTop} x2={goalLeft + goalWidth} y2={goalTop + goalHeight} stroke="hsl(0, 0%, 100%)" strokeWidth="2.5" />
        <line x1={goalLeft} y1={goalTop} x2={goalLeft + goalWidth} y2={goalTop} stroke="hsl(0, 0%, 100%)" strokeWidth="2.5" />

        {/* Ground line */}
        <line x1="5" y1={goalTop + goalHeight} x2="95" y2={goalTop + goalHeight} stroke="hsl(0, 0%, 90%)" strokeWidth="0.5" opacity="0.5" />

        {/* Zone labels (subtle) */}
        <text x={goalLeft + goalWidth * 0.17} y={goalTop + goalHeight * 0.35} textAnchor="middle" fontSize="3" fill="hsl(0, 0%, 70%)" opacity="0.3">Vänster</text>
        <text x={goalLeft + goalWidth * 0.5} y={goalTop + goalHeight * 0.35} textAnchor="middle" fontSize="3" fill="hsl(0, 0%, 70%)" opacity="0.3">Mitt</text>
        <text x={goalLeft + goalWidth * 0.83} y={goalTop + goalHeight * 0.35} textAnchor="middle" fontSize="3" fill="hsl(0, 0%, 70%)" opacity="0.3">Höger</text>

        {/* Dimension label */}
        <text x="50" y="88" textAnchor="middle" fontSize="2.5" fill="hsl(0, 0%, 70%)" opacity="0.5">
          {dim.aspectLabel}
        </text>

        {/* Shot markers */}
        {shots.map((shot) => {
          const pos = getMarkerPosition(shot);
          if (!pos) return null;
          const isGoal = shot.outcome === 'goal';
          return (
            <g key={shot.id}>
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={isGoal ? 2.5 : 2}
                fill={getMarkerColor(shot.outcome)}
                opacity={0.85}
                stroke="hsl(0, 0%, 100%)"
                strokeWidth="0.4"
              />
              {isGoal && (
                <text x={pos.cx} y={pos.cy + 0.8} textAnchor="middle" fontSize="2" fill="white">⚽</text>
              )}
            </g>
          );
        })}

        {/* Tap instruction */}
        {interactive && shots.length === 0 && (
          <text x="50" y={goalTop + goalHeight * 0.6} textAnchor="middle" fontSize="3.5" fill="hsl(0, 0%, 80%)" opacity="0.6">
            Tryck vart skottet gick
          </text>
        )}
      </svg>
    </div>
  );
}
