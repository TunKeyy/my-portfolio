'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sun, Moon, Wifi, Battery, Search, type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../lib/theme.provider'
import { AppIcon } from './app-icon'

interface TabletApp {
  id: string
  title: string
  glyph: LucideIcon
  gradient: string
  href?: string
}

interface TabletLayoutProps {
  apps: TabletApp[]
  renderContent: (id: string) => React.ReactNode
}

function TabletMenuBar({
  activeTitle,
  onToggleTheme,
}: {
  activeTitle: string
  onToggleTheme: () => void
}) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    tick()
    const i = setInterval(tick, 30000)
    return () => clearInterval(i)
  }, [])

  return (
    <div
      className={`fixed top-0 inset-x-0 h-8 backdrop-blur-2xl z-[9999] flex items-center justify-between px-5 text-[13px] select-none ${
        isLight
          ? 'bg-white/70 border-b border-black/10 text-gray-600'
          : 'bg-black/60 border-b border-white/5 text-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sm">🍒</span>
        <span
          className={`font-semibold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}
        >
          {activeTitle}
        </span>
        {['File', 'Edit', 'View'].map((m) => (
          <span
            key={m}
            className={`cursor-default transition-colors ${
              isLight
                ? 'text-gray-500 hover:text-gray-800'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {m}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className={`transition-colors ${
            isLight ? 'hover:text-gray-900' : 'hover:text-white'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
        <Search className="w-3.5 h-3.5 text-gray-500" />
        <Wifi className="w-3.5 h-3.5 text-gray-500" />
        <Battery className="w-4 h-3.5 text-gray-500" />
        <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>
          {time}
        </span>
      </div>
    </div>
  )
}

function TabletDock({
  apps,
  activeApp,
  openApps,
  onSelect,
}: {
  apps: TabletApp[]
  activeApp: string | null
  openApps: string[]
  onSelect: (id: string) => void
}) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9998]">
      <div
        className={`flex items-end gap-2 px-4 py-2.5 backdrop-blur-2xl rounded-2xl shadow-2xl ${
          isLight
            ? 'bg-white/60 border border-black/10 shadow-black/10'
            : 'bg-white/10 border border-white/20 shadow-black/40'
        }`}
      >
        {apps.map((item) => {
          const isOpen = openApps.includes(item.id)
          const isActive = activeApp === item.id

          return (
            <div key={item.id} className="flex flex-col items-center">
              <button
                onClick={() => onSelect(item.id)}
                className={`group relative flex flex-col items-center px-2 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isLight
                      ? 'bg-black/5'
                      : 'bg-white/10'
                    : ''
                }`}
                title={item.title}
              >
                <div className="transition-transform duration-200 group-hover:scale-110 drop-shadow-lg">
                  <AppIcon glyph={item.glyph} gradient={item.gradient} size="dock" />
                </div>
                <span
                  className={`absolute -top-8 px-2.5 py-1 backdrop-blur text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg ${
                    isLight
                      ? 'bg-gray-800/90 text-white border border-white/10'
                      : 'bg-gray-800/95 text-white border border-white/10'
                  }`}
                >
                  {item.title}
                </span>
              </button>
              <span
                className={`w-1 h-1 rounded-full mt-0.5 transition-colors ${
                  isOpen
                    ? isLight
                      ? 'bg-black/50'
                      : 'bg-white/70'
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

export function TabletLayout({ apps, renderContent }: TabletLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [openApps, setOpenApps] = useState<string[]>([])
  const router = useRouter()

  const openApp = (app: TabletApp) => {
    if (app.href) {
      router.push(app.href)
      return
    }
    if (!openApps.includes(app.id)) {
      setOpenApps((prev) => [...prev, app.id])
    }
    setActiveApp(app.id)
  }

  const closeApp = (id: string) => {
    setOpenApps((prev) => prev.filter((a) => a !== id))
    setActiveApp((prev) => {
      if (prev !== id) return prev
      const remaining = openApps.filter((a) => a !== id)
      return remaining.length > 0 ? remaining[remaining.length - 1] : null
    })
  }

  const handleDockSelect = (id: string) => {
    const app = apps.find((a) => a.id === id)
    if (!app) return
    if (app.href) {
      router.push(app.href)
      return
    }
    if (activeApp === id) {
      setActiveApp(null)
    } else if (openApps.includes(id)) {
      setActiveApp(id)
    } else {
      openApp(app)
    }
  }

  const activeAppData = apps.find((a) => a.id === activeApp)
  const activeTitle = activeAppData?.title ?? 'Finder'

  return (
    <div
      className={`fixed inset-0 ${
        isLight ? 'desktop-wallpaper-light' : 'desktop-wallpaper'
      }`}
    >
      <TabletMenuBar
        activeTitle={activeTitle}
        onToggleTheme={toggleTheme}
      />

      {/* Desktop Icons Grid */}
      <div className="absolute top-10 right-4 flex flex-col gap-1 pt-2">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => openApp(app)}
            className="flex flex-col items-center gap-1 w-[72px] p-2 rounded-xl hover:bg-white/10 transition-colors group"
          >
            <div className="group-hover:scale-110 transition-transform drop-shadow-lg">
              <AppIcon glyph={app.glyph} gradient={app.gradient} size="grid" />
            </div>
            <span className="text-[10px] text-center leading-tight drop-shadow-md font-medium text-white/80 w-16 truncate">
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* Centered Window (maximized, no drag) */}
      <AnimatePresence>
        {activeApp && activeAppData && (
          <motion.div
            key={activeApp}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed z-[100] flex flex-col overflow-hidden rounded-xl ${
              isLight
                ? 'shadow-2xl shadow-black/20 ring-1 ring-black/10'
                : 'shadow-2xl shadow-black/70 ring-1 ring-white/15'
            }`}
            style={{
              top: 36,
              left: 16,
              right: 16,
              bottom: 72,
            }}
          >
            {/* Title bar */}
            <div
              className={`flex items-center px-4 h-10 shrink-0 select-none ${
                isLight
                  ? 'bg-[#e8e8ec] border-b border-black/5'
                  : 'bg-[#323236] border-b border-white/5'
              }`}
            >
              {/* Traffic lights */}
              <div className="flex gap-2 mr-4">
                <button
                  onClick={() => closeApp(activeApp)}
                  className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition group relative"
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black/60 opacity-0 group-hover:opacity-100">
                    ✕
                  </span>
                </button>
                <span className="w-3 h-3 rounded-full bg-[#febc2e] opacity-40" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] opacity-40" />
              </div>
              <div className="flex-1 text-center">
                <span
                  className={`text-[13px] flex items-center justify-center gap-1.5 ${
                    isLight ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  <AppIcon glyph={activeAppData.glyph} gradient={activeAppData.gradient} size="sm" />
                  <span>{activeAppData.title}</span>
                </span>
              </div>
              {/* Close button for easy touch */}
              <button
                onClick={() => closeApp(activeApp)}
                className={`p-1 rounded-md transition-colors ${
                  isLight
                    ? 'hover:bg-black/5 text-gray-500'
                    : 'hover:bg-white/10 text-gray-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div
              className={`flex-1 overflow-y-auto custom-scrollbar ${
                isLight ? 'bg-white' : 'bg-[#1c1c1e]'
              }`}
            >
              {renderContent(activeApp)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TabletDock
        apps={apps}
        activeApp={activeApp}
        openApps={openApps}
        onSelect={handleDockSelect}
      />

      {/* Footer */}
      <div
        className={`fixed bottom-[60px] left-4 text-[10px] select-none ${
          isLight ? 'text-black/15' : 'text-white/15'
        }`}
      >
        © 2025 | Designed and coded ❤️ by Kha Nguyen
      </div>
    </div>
  )
}
