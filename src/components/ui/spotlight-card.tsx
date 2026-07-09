import { useEffect, useRef, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange'
}

const glowColorMap = {
  blue:   { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green:  { base: 120, spread: 200 },
  red:    { base: 0,   spread: 200 },
  orange: { base: 30,  spread: 200 },
}

// Injected once into <head> on first mount
let stylesInjected = false
const CSS = `
[data-glow]::before,
[data-glow]::after {
  pointer-events: none;
  content: "";
  position: absolute;
  inset: calc(var(--border-size) * -1);
  border: var(--border-size) solid transparent;
  border-radius: calc(var(--radius) * 1px);
  background-attachment: fixed;
  background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
  background-repeat: no-repeat;
  background-position: 50% 50%;
  mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}
[data-glow]::before {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
    calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
    transparent 100%
  );
  filter: brightness(2);
}
[data-glow]::after {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
    calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(0 100% 100% / var(--border-light-opacity, 1)),
    transparent 100%
  );
}
[data-glow] [data-glow] {
  position: absolute;
  inset: 0;
  will-change: filter;
  opacity: var(--outer, 1);
  border-radius: calc(var(--radius) * 1px);
  border-width: calc(var(--border-size) * 20);
  filter: blur(calc(var(--border-size) * 10));
  background: none;
  pointer-events: none;
  border: none;
}
[data-glow] > [data-glow]::before {
  inset: -10px;
  border-width: 10px;
}
`

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  const tag = document.createElement('style')
  tag.textContent = CSS
  document.head.appendChild(tag)
  stylesInjected = true
}

export function GlowCard({ children, className = '', glowColor = 'blue' }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { base, spread } = glowColorMap[glowColor]

  useEffect(() => {
    injectStyles()
    const sync = (e: PointerEvent) => {
      if (!cardRef.current) return
      cardRef.current.style.setProperty('--x', e.clientX.toFixed(2))
      cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2))
      cardRef.current.style.setProperty('--y', e.clientY.toFixed(2))
      cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2))
    }
    document.addEventListener('pointermove', sync)
    return () => document.removeEventListener('pointermove', sync)
  }, [])

  return (
    <div
      ref={cardRef}
      data-glow
      className={`relative rounded-2xl ${className}`}
      style={{
        '--base': base,
        '--spread': spread,
        '--radius': '14',
        '--border': '2',
        '--backdrop': 'hsl(0 0% 50% / 0.08)',
        '--backup-border': 'var(--backdrop)',
        '--size': '280',
        '--outer': '1',
        '--border-size': 'calc(var(--border, 2) * 1px)',
        '--spotlight-size': 'calc(var(--size, 150) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
          hsl(var(--hue, 210) 100% 70% / 0.08),
          transparent
        )`,
        backgroundColor: 'var(--backdrop, transparent)',
        backgroundAttachment: 'fixed',
        border: 'var(--border-size) solid var(--backup-border)',
        touchAction: 'none',
      } as React.CSSProperties}
    >
      <div data-glow />
      {children}
    </div>
  )
}
