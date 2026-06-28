import { type LucideIcon } from 'lucide-react'

type Size = 'dock' | 'grid' | 'sm'

const SIZES: Record<Size, { tile: string; icon: string }> = {
  dock: { tile: 'w-12 h-12', icon: 'w-7 h-7' },
  grid: { tile: 'w-14 h-14', icon: 'w-8 h-8' },
  sm: { tile: 'w-8 h-8', icon: 'w-5 h-5' },
}

export function AppIcon({
  glyph: Glyph,
  gradient,
  size = 'dock',
}: {
  glyph: LucideIcon
  gradient: string
  size?: Size
}) {
  const s = SIZES[size]
  return (
    <div
      className={`${s.tile} rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg ring-1 ring-white/10`}
    >
      <Glyph className={`${s.icon} text-white drop-shadow`} strokeWidth={2} />
    </div>
  )
}
