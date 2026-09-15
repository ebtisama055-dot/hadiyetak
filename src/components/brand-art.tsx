// Soft, premium line-art illustrations used as decorative visuals on the
// homepage (Hero, Promotional Banner). Kept as inline SVG — on-brand,
// dependency-free, and never a stand-in "mockup": these render for real in
// production, styled entirely from the approved core palette.

export function GiftBoxIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 380" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="صندوق هدية فاخر بلون وردي مع شريط">
      <circle cx="210" cy="200" r="165" fill="#F7D7DC" opacity="0.55" />
      <circle cx="300" cy="110" r="46" fill="#F3C6B8" opacity="0.55" />
      <circle cx="90" cy="290" r="34" fill="#E6C9A8" opacity="0.5" />

      {/* box body */}
      <rect x="95" y="175" width="230" height="150" rx="14" fill="#D98FA1" />
      <rect x="95" y="175" width="230" height="150" rx="14" fill="url(#boxShade)" />
      <rect x="80" y="150" width="260" height="45" rx="10" fill="#C17389" />

      {/* ribbon vertical */}
      <rect x="192" y="150" width="36" height="175" fill="#EADDCB" />
      {/* ribbon bow */}
      <path d="M210 150c-8-26-46-30-56-8-8 18 10 30 28 22 4-2 8-2 8-2" fill="none" stroke="#EADDCB" strokeWidth="8" strokeLinecap="round" />
      <path d="M210 150c8-26 46-30 56-8 8 18-10 30-28 22-4-2-8-2-8-2" fill="none" stroke="#EADDCB" strokeWidth="8" strokeLinecap="round" />
      <circle cx="210" cy="150" r="9" fill="#EADDCB" />

      {/* decorative line: small heart + sparkle */}
      <path d="M330 235c0 0-13-8-13-17 0-5 4-8 8-8 3 0 5 1 5 4 0-3 2-4 5-4 4 0 8 3 8 8 0 9-13 17-13 17z" fill="none" stroke="#D7B8C4" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M75 165l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#D7B8C4" opacity="0.8" />

      <defs>
        <linearGradient id="boxShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.06" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FlowersAndRibbonIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 320" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="صندوق هدية مع باقة ورد">
      <ellipse cx="210" cy="270" rx="170" ry="30" fill="#F7D7DC" opacity="0.5" />

      {/* box */}
      <rect x="130" y="150" width="160" height="110" rx="12" fill="#F3C6B8" />
      <rect x="118" y="130" width="184" height="34" rx="8" fill="#D98FA1" />
      <rect x="200" y="130" width="20" height="130" fill="#EADDCB" />

      {/* flowers */}
      {[
        { cx: 150, cy: 110, fill: '#D98FA1' },
        { cx: 190, cy: 85, fill: '#D7B8C4' },
        { cx: 230, cy: 95, fill: '#E6C9A8' },
        { cx: 265, cy: 120, fill: '#C8D5C1' },
        { cx: 210, cy: 65, fill: '#D98FA1' },
      ].map((f, i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx={f.cx + 11 * Math.cos((a * Math.PI) / 180)}
              cy={f.cy + 11 * Math.sin((a * Math.PI) / 180)}
              rx="9"
              ry="6"
              fill={f.fill}
              opacity="0.85"
              transform={`rotate(${a} ${f.cx} ${f.cy})`}
            />
          ))}
          <circle cx={f.cx} cy={f.cy} r="6" fill="#EADDCB" />
        </g>
      ))}
      <path d="M150 118v22M190 96v20M230 106v18M265 130v14M210 76v22" stroke="#C8D5C1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
