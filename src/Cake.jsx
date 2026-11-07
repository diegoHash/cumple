export default function Cake() {
  return (
    <svg viewBox="0 0 300 300" className="cake-svg" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb3cf" />
          <stop offset="1" stopColor="#ff6fa3" />
        </linearGradient>
        <linearGradient id="ct" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0f6" />
          <stop offset="1" stopColor="#ffc2da" />
        </linearGradient>
        <radialGradient id="fl" cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor="#fff7b0" />
          <stop offset="1" stopColor="#ff9f1c" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="276" rx="125" ry="12" fill="rgba(0,0,0,.25)" />
      {/* plato */}
      <rect x="25" y="258" width="250" height="14" rx="7" fill="#fff" opacity=".9" />
      {/* piso inferior */}
      <rect x="40" y="170" width="220" height="92" rx="14" fill="url(#cb)" />
      <path d="M40 190 q18 22 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 v-20 h-220z" fill="url(#ct)" />
      {/* piso superior */}
      <rect x="75" y="108" width="150" height="66" rx="12" fill="url(#cb)" />
      <path d="M75 126 q15 20 30 0 t30 0 t30 0 t30 0 t30 0 v-18 h-150z" fill="url(#ct)" />
      {/* decoración */}
      <g fill="#e0245e">
        <text x="70" y="236" fontSize="22">♥</text>
        <text x="130" y="244" fontSize="22">♥</text>
        <text x="188" y="236" fontSize="22">♥</text>
        <text x="100" y="160" fontSize="16">♥</text>
        <text x="182" y="160" fontSize="16">♥</text>
      </g>
      {/* velas */}
      {[115, 150, 185].map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y="68" width="10" height="42" rx="3" fill={i === 1 ? '#c77dff' : '#ffd166'} />
          <rect x={x - 5} y="78" width="10" height="5" fill="#fff" opacity=".6" />
          <path className="flame" style={{ animationDelay: `${i * 0.2}s` }}
            d={`M${x} 42 C${x + 12} 54 ${x + 9} 66 ${x} 68 C${x - 9} 66 ${x - 12} 54 ${x} 42z`}
            fill="url(#fl)" />
        </g>
      ))}
    </svg>
  )
}
