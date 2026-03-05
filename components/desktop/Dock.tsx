'use client'

import { useDesktop } from './DesktopProvider'
import { useTheme } from '../../lib/theme.provider'

export interface DockItem {
  id: string
  icon: string
  title: string
}

interface DockProps {
  items: DockItem[]
}

export function Dock({ items }: DockProps) {
  const { windowStates, openWindow, focusWindow, minimizeWindow } = useDesktop()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const handleClick = (id: string) => {
    const state = windowStates[id]
    if (state?.isOpen && !state?.isMinimized) {
      minimizeWindow(id)
    } else if (state?.isOpen && state?.isMinimized) {
      focusWindow(id)
    } else {
      openWindow(id)
    }
  }

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9998]">
      <div className={`flex items-end gap-1 px-3 py-2 backdrop-blur-2xl rounded-2xl shadow-2xl ${
        isLight
          ? 'bg-white/60 border border-black/10 shadow-black/10'
          : 'bg-white/10 border border-white/20 shadow-black/40'
      }`}>
        {items.map((item) => {
          const state = windowStates[item.id]
          const isRunning = !!state?.isOpen

          return (
            <div key={item.id} className="flex flex-col items-center">
              <button
                onClick={() => handleClick(item.id)}
                className="group relative flex flex-col items-center px-1.5 py-0.5 rounded-xl transition-all duration-200 hover:-translate-y-3"
                title={item.title}
              >
                <span className="text-[32px] drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                {/* Tooltip */}
                <span className={`absolute -top-9 px-2.5 py-1 backdrop-blur text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg ${
                  isLight
                    ? 'bg-gray-800/90 text-white border border-white/10'
                    : 'bg-gray-800/95 text-white border border-white/10'
                }`}>
                  {item.title}
                </span>
              </button>
              {/* Running indicator */}
              <span
                className={`w-1 h-1 rounded-full mt-0.5 transition-colors ${
                  isRunning
                    ? isLight ? 'bg-black/50' : 'bg-white/70'
                    : 'bg-transparent'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
