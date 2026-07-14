// Gráfica SVG simple (sin librerías) de series 1-5 a lo largo de los días.

export type Series = {
  label: string;
  color: string;
  values: (number | null)[];
};

export default function TrendChart({
  days,
  series,
}: {
  days: string[]; // etiquetas cortas del eje X
  series: Series[];
}) {
  const W = 320;
  const H = 160;
  const padL = 22;
  const padR = 8;
  const padT = 10;
  const padB = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = days.length;

  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  // Escala 1..5 (5 arriba, 1 abajo).
  const y = (v: number) => padT + innerH - ((v - 1) / 4) * innerH;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Gráfica de evolución"
      >
        {/* Líneas guía horizontales para 1..5 */}
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(v)}
              y2={y(v)}
              stroke="#fbe3ea"
              strokeWidth={1}
            />
            <text x={4} y={y(v) + 3} fontSize={8} fill="#c98aa0">
              {v}
            </text>
          </g>
        ))}

        {/* Series */}
        {series.map((s) => {
          const pts = s.values
            .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
            .filter((p): p is string => p !== null);
          return (
            <g key={s.label}>
              {pts.length > 1 && (
                <polyline
                  points={pts.join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {s.values.map((v, i) =>
                v == null ? null : (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(v)}
                    r={2.5}
                    fill={s.color}
                  />
                ),
              )}
            </g>
          );
        })}

        {/* Etiquetas eje X (primer, medio y último día) */}
        {[0, Math.floor((n - 1) / 2), n - 1]
          .filter((i, idx, arr) => arr.indexOf(i) === idx && i >= 0)
          .map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              fontSize={8}
              fill="#c98aa0"
              textAnchor="middle"
            >
              {days[i]}
            </text>
          ))}
      </svg>

      {/* Leyenda */}
      <div className="mt-2 flex flex-wrap gap-3">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-rose-700/70">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
