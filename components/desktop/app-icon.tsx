import { type LucideIcon } from 'lucide-react'

type Size = 'dock' | 'grid' | 'sm'

const SIZES: Record<Size, { tile: string; icon: string }> = {
  dock: { tile: 'w-12 h-12', icon: 'w-6 h-6' },
  grid: { tile: 'w-14 h-14', icon: 'w-7 h-7' },
  sm: { tile: 'w-8 h-8', icon: 'w-[18px] h-[18px]' },
}

// macOS-style app tile: squircle, saturated top-to-bottom gradient, specular top highlight,
// inset rim light + bottom shade, and a soft drop shadow.
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
      className={`relative ${s.tile} rounded-[24%] overflow-hidden bg-gradient-to-b ${gradient} ring-1 ring-black/10 shadow-[0_4px_10px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_5px_rgba(0,0,0,0.22)]`}
    >
      {/* top specular sheen */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <Glyph
          className={`${s.icon} text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]`}
          strokeWidth={2.1}
        />
      </span>
    </div>
  )
}
