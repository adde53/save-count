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

// Sport-specific visual configs
const SPORT_VISUALS: Record<SportType, {
  bgColor: string;
  frameColor: string;
  netPattern: string;
  netOpacity: number;
  postWidth: number;
  cornerRadius: number;
  extraElements?: 'crossbar_round' | 'ice_crease' | 'water';
}> = {
  innebandy: {
    bgColor: 'hsl(30, 30%, 35%)',
    frameColor: 'hsl(0, 0%, 95%)',
    netPattern: 'hsl(0, 0%, 80%)',
    netOpacity: 0.4,
    postWidth: 2,
    cornerRadius: 2,
  },
  fotboll: {
    bgColor: 'hsl(142, 40%, 25%)',
    frameColor: 'hsl(0, 0%, 95%)',
    netPattern: 'hsl(0, 0%, 80%)',
    netOpacity: 0.3,
    postWidth: 2.5,
    cornerRadius: 1,
  },
  handboll: {
    bgColor: 'hsl(30, 25%, 40%)',
    frameColor: 'hsl(0, 70%, 50%)',
    netPattern: 'hsl(0, 0%, 75%)',
    netOpacity: 0.35,
    postWidth: 2.5,
    cornerRadius: 1,
  },
  ishockey: {
    bgColor: 'hsl(200, 30%, 85%)',
    frameColor: 'hsl(0, 70%, 45%)',
    netPattern: 'hsl(0, 0%, 60%)',
    netOpacity: 0.5,
    postWidth: 3,
    cornerRadius: 0,
    extraElements: 'ice_crease',
  },
  futsal: {
    bgColor: 'hsl(30, 20%, 45%)',
    frameColor: 'hsl(0, 0%, 90%)',
    netPattern: 'hsl(0, 0%, 70%)',
    netOpacity: 0.3,
    postWidth: 2,
    cornerRadius: 1,
  },
  lacrosse: {
    bgColor: 'hsl(142, 35%, 30%)',
    frameColor: 'hsl(30, 60%, 50%)',
    netPattern: 'hsl(0, 0%, 75%)',
    netOpacity: 0.45,
    postWidth: 2,
    cornerRadius: 8,
  },
  vattenpoloball: {
    bgColor: 'hsl(200, 60%, 40%)',
    frameColor: 'hsl(0, 0%, 95%)',
    netPattern: 'hsl(0, 0%, 80%)',
    netOpacity: 0.3,
    postWidth: 2,
    cornerRadius: 1,
    extraElements: 'water',
  },
};

export default function GoalView({ sport, shots, onTapGoal, interactive = true, className = '' }: GoalViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dim = getGoalDimension(sport);
  const visuals = SPORT_VISUALS[sport];

  // Adjust viewBox aspect ratio based on goal proportions
  const aspectRatio = dim.width / dim.height;
  const viewBoxWidth = 100;
  const viewBoxHeight = Math.round(viewBoxWidth / Math.max(aspectRatio, 0.8) * 0.9 + 15);

  const goalLeft = 10;
  const goalTop = 8;
  const goalWidth = 80;
  const goalHeight = viewBoxHeight - 18;

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

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    onTapGoal(x, y);
  }, [interactive, onTapGoal]);

  const getMarkerColor = (outcome: ShotOutcome) => OUTCOME_CONFIG[outcome].color;

  const getMarkerPosition = (shot: ShotEvent) => {
    if (shot.positionX == null || shot.positionY == null) return null;
    const cx = shot.positionX * viewBoxWidth;
    const cy = shot.positionY * viewBoxHeight;
    return { cx, cy };
  };

  return (
    <div className={`w-full ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className={`w-full h-auto ${interactive ? 'cursor-crosshair' : ''}`}
        onClick={handleClick}
        style={{ maxHeight: '55vh' }}
      >
        {/* Background */}
        <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} rx="3" fill={visuals.bgColor} />

        {/* Ice crease for hockey */}
        {visuals.extraElements === 'ice_crease' && (
          <ellipse
            cx={goalLeft + goalWidth / 2}
            cy={goalTop + goalHeight}
            rx={goalWidth * 0.4}
            ry={goalHeight * 0.25}
            fill="hsl(210, 50%, 75%)"
            opacity="0.2"
            stroke="hsl(0, 70%, 45%)"
            strokeWidth="0.5"
            strokeDasharray="2 1"
          />
        )}

        {/* Water effect for water polo */}
        {visuals.extraElements === 'water' && (
          <>
            <rect x="0" y={goalTop + goalHeight - 2} width={viewBoxWidth} height={viewBoxHeight - goalTop - goalHeight + 4} fill="hsl(200, 70%, 35%)" rx="0" />
            {[0, 1, 2].map(i => (
              <path
                key={i}
                d={`M 0 ${goalTop + goalHeight + i * 3} Q 25 ${goalTop + goalHeight + i * 3 - 1.5} 50 ${goalTop + goalHeight + i * 3} T 100 ${goalTop + goalHeight + i * 3}`}
                fill="none"
                stroke="hsl(200, 80%, 60%)"
                strokeWidth="0.4"
                opacity={0.3 - i * 0.08}
              />
            ))}
          </>
        )}

        {/* Goal net pattern */}
        <defs>
          <pattern id={`net-${sport}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 4 4 M 4 0 L 0 4" stroke={visuals.netPattern} strokeWidth="0.15" opacity={visuals.netOpacity} />
          </pattern>
        </defs>
        <rect x={goalLeft} y={goalTop} width={goalWidth} height={goalHeight} fill={`url(#net-${sport})`} rx={visuals.cornerRadius} />
        <rect x={goalLeft} y={goalTop} width={goalWidth} height={goalHeight} fill="hsl(0, 0%, 100%)" opacity="0.06" rx={visuals.cornerRadius} />

        {/* Goal frame */}
        <rect
          x={goalLeft} y={goalTop} width={goalWidth} height={goalHeight}
          fill="none"
          stroke={visuals.frameColor}
          strokeWidth={visuals.postWidth}
          rx={visuals.cornerRadius}
        />

        {/* Post highlights */}
        <line x1={goalLeft} y1={goalTop} x2={goalLeft} y2={goalTop + goalHeight} stroke={visuals.frameColor} strokeWidth={visuals.postWidth + 0.5} />
        <line x1={goalLeft + goalWidth} y1={goalTop} x2={goalLeft + goalWidth} y2={goalTop + goalHeight} stroke={visuals.frameColor} strokeWidth={visuals.postWidth + 0.5} />
        <line x1={goalLeft} y1={goalTop} x2={goalLeft + goalWidth} y2={goalTop} stroke={visuals.frameColor} strokeWidth={visuals.postWidth + 0.5} />

        {/* Ground line */}
        <line x1="5" y1={goalTop + goalHeight} x2="95" y2={goalTop + goalHeight} stroke="hsl(0, 0%, 90%)" strokeWidth="0.5" opacity="0.4" />

        {/* Dimension label */}
        <text x="50" y={viewBoxHeight - 2} textAnchor="middle" fontSize="2.5" fill="hsl(0, 0%, 70%)" opacity="0.5">
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
          <text x="50" y={goalTop + goalHeight * 0.55} textAnchor="middle" fontSize="3.5" fill="hsl(0, 0%, 80%)" opacity="0.6">
            Tryck vart skottet gick
          </text>
        )}
      </svg>
    </div>
  );
}
