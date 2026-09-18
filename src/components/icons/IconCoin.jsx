// Ícono de moneda personalizado (óvalo con 4 líneas) — no existe un ícono lineal
// estándar igual en Tabler, así que se dibuja a mano con la misma API que los
// íconos de @tabler/icons-react para poder usarlo de forma intercambiable.
export default function IconCoin({ size = 24, color = 'currentColor', stroke = 1.8, className, style, ...rest }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={className} style={{ color, ...style }}
      aria-hidden="true" {...rest}
    >
      <rect x="6" y="2" width="12" height="20" rx="6" stroke="currentColor" strokeWidth={stroke} />
      <line x1="8" y1="6.5" x2="16" y2="6.5" stroke="currentColor" strokeWidth={stroke * 0.8} strokeLinecap="round" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth={stroke * 0.8} strokeLinecap="round" />
      <line x1="8" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth={stroke * 0.8} strokeLinecap="round" />
      <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth={stroke * 0.8} strokeLinecap="round" />
    </svg>
  )
}
