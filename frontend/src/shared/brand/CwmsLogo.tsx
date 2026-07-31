import { useId, type SVGProps } from 'react'

type CwmsLogoProps = SVGProps<SVGSVGElement> & {
  variant?: 'color' | 'reverse'
  showWordmark?: boolean
}

/** Inline CWMS brand mark (+ optional wordmark). Avoids broken &lt;img&gt; loads. */
export function CwmsLogo({
  variant = 'color',
  showWordmark = true,
  className,
  ...rest
}: CwmsLogoProps) {
  const gradId = useId().replace(/:/g, '')
  const navy = variant === 'reverse' ? '#FFFFFF' : '#0F2D5C'
  const accent = '#F4A100'
  const bldgFill = variant === 'reverse' ? '#D7DEE8' : `url(#${gradId})`
  const viewBox = showWordmark ? '0 0 420 128' : '0 0 120 128'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      className={className}
      role="img"
      aria-label="CWMS — Construction Work Management System"
      {...rest}
    >
      <defs>
        {variant === 'color' && (
          <linearGradient
            id={gradId}
            x1="40"
            y1="88"
            x2="40"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0F2D5C" />
            <stop offset="0.55" stopColor="#3A557A" />
            <stop offset="1" stopColor="#9AABBF" />
          </linearGradient>
        )}
      </defs>

      <g>
        <path
          fill={variant === 'reverse' ? navy : accent}
          d="M20 94c3-9 10-15 20-16h48c10 1 17 7 20 16l5 3.5c1.6 2.2-.2 5.5-2.9 5.5H17.9c-2.7 0-4.5-3.3-2.9-5.5L20 94z"
        />
        <g fill={variant === 'reverse' ? navy : accent}>
          <rect x="26" y="100" width="9" height="13" rx="1.5" />
          <rect x="41" y="102" width="9" height="13" rx="1.5" />
          <rect x="56" y="103" width="9" height="13" rx="1.5" />
          <rect x="71" y="103" width="9" height="13" rx="1.5" />
          <rect x="86" y="102" width="9" height="13" rx="1.5" />
        </g>
        <path
          stroke={navy}
          strokeWidth="10"
          strokeLinejoin="miter"
          strokeLinecap="square"
          d="M100 40 84 20H44L24 40v38l20 20h40"
        />
        <path fill={bldgFill} d="M38 88V52l8-6v42H38z" />
        <path fill={navy} d="M46 46v42h6V52l-6-6z" />
        <path fill={bldgFill} d="M54 88V40l10-8v56H54z" />
        <path fill={navy} d="M64 32v56h8V42l-8-10z" />
        <path fill={bldgFill} d="M74 88V48l8-6v46H74z" />
        <path fill={navy} d="M82 42v46h6V50l-6-8z" />
        <g
          fill={variant === 'reverse' ? navy : accent}
          stroke={variant === 'reverse' ? navy : accent}
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <rect x="92" y="34" width="3.5" height="54" rx="0.4" stroke="none" />
          <path d="M86 36h26M93.5 39H108M110 39v13" />
          <path stroke="none" d="M108 52h4l-2 4-2-4z" />
          <rect x="90" y="40" width="8" height="6" rx="0.5" stroke="none" />
        </g>
      </g>

      {showWordmark && (
        <g fontFamily="Raleway, Inter, Arial, Helvetica, sans-serif">
          <text
            x="140"
            y="58"
            fontSize="48"
            fontWeight="700"
            fill={navy}
            letterSpacing="2"
          >
            CWM
            <tspan fill={accent}>S</tspan>
          </text>
          <text
            x="140"
            y="82"
            fontSize="11"
            fontWeight="600"
            fill={navy}
            letterSpacing="1.5"
            fontFamily="Inter, Arial, Helvetica, sans-serif"
          >
            CONSTRUCTION WORK MANAGEMENT SYSTEM
          </text>
          <line
            x1="140"
            y1="92"
            x2="390"
            y2="92"
            stroke={navy}
            strokeWidth="1"
            opacity={variant === 'reverse' ? 0.7 : 1}
          />
          <text
            x="265"
            y="110"
            textAnchor="middle"
            fontSize="10"
            fontWeight="500"
            fill={navy}
            letterSpacing="2"
            fontFamily="Inter, Arial, Helvetica, sans-serif"
          >
            PLAN <tspan fill={accent}>•</tspan> MANAGE{' '}
            <tspan fill={accent}>•</tspan> BUILD <tspan fill={accent}>•</tspan>{' '}
            SUCCEED
          </text>
        </g>
      )}
    </svg>
  )
}
