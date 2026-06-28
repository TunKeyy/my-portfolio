'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Sun, Moon, Wifi, Battery, type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../lib/theme.provider'
import { AppIcon } from './app-icon'

interface MobileApp {
  id: string
  title: string
  glyph: LucideIcon
  gradient: string
  href?: string
}

interface MobileLayoutProps {
  apps: MobileApp[]
  renderContent: (id: string) => React.ReactNode
}

function MobileStatusBar() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
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
      className={`fixed top-0 inset-x-0 h-11 z-[9999] flex items-center justify-between px-5 text-[13px] select-none ${
        isLight
          ? 'bg-white/80 backdrop-blur-xl border-b border-black/5 text-gray-600'
          : 'bg-black/60 backdrop-blur-xl border-b border-white/5 text-gray-300'
      }`}
    >
      <span className="font-medium">{time}</span>
      <span className="font-semibold text-base">🍒</span>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-1">
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
        <Wifi className="w-3.5 h-3.5 text-gray-500" />
        <Battery className="w-4 h-3.5 text-gray-500" />
      </div>
    </div>
  )
}

function MobileAppHeader({
  title,
  glyph,
  gradient,
  onBack,
}: {
  title: string
  glyph: LucideIcon
  gradient: string
  onBack: () => void
}) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div
      className={`sticky top-0 z-50 flex items-center h-12 px-3 backdrop-blur-xl ${
        isLight
          ? 'bg-white/80 border-b border-black/5'
          : 'bg-[#1c1c1e]/80 border-b border-white/5'
      }`}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-0.5 text-blue-500 text-sm font-medium mr-3"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      <div className="flex-1 text-center">
        <span
          className={`text-[14px] font-semibold flex items-center justify-center gap-1.5 ${
            isLight ? 'text-gray-800' : 'text-white'
          }`}
        >
          <AppIcon glyph={glyph} gradient={gradient} size="sm" />
          <span>{title}</span>
        </span>
      </div>
      <div className="w-[60px]" />
    </div>
  )
}

export function MobileLayout({ apps, renderContent }: MobileLayoutProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const router = useRouter()

  const handleAppClick = (app: MobileApp) => {
    if (app.href) {
      router.push(app.href)
      return
    }
    setActiveApp(app.id)
  }

  const activeAppData = apps.find((a) => a.id === activeApp)

  return (
    <div
      className={`fixed inset-0 ${
        isLight ? 'desktop-wallpaper-light' : 'desktop-wallpaper'
      }`}
    >
      <MobileStatusBar />

      {/* Home Screen */}
      <AnimatePresence>
        {!activeApp && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 pt-14 pb-6 px-6 overflow-y-auto"
          >
            {/* Greeting */}
            <div className="mb-8 mt-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Kha&apos;s Zone
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Tap an app to explore
              </p>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <AppIcon glyph={app.glyph} gradient={app.gradient} size="grid" />
                  <span className="text-[11px] text-white font-medium drop-shadow-md text-center leading-tight w-16 truncate">
                    {app.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom Dock on home screen */}
            <div
              className={`fixed bottom-4 left-4 right-4 flex items-center justify-evenly py-3 rounded-3xl backdrop-blur-2xl ${
                isLight
                  ? 'bg-white/50 border border-black/5'
                  : 'bg-black/30 border border-white/10'
              }`}
            >
              {apps.slice(0, 4).map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="flex flex-col items-center active:scale-95 transition-transform"
                >
                  <AppIcon glyph={app.glyph} gradient={app.gradient} size="dock" />
                </button>
              ))}
            </div>

            {/* Footer */}
            <div
              className={`mt-8 mb-20 text-center text-[10px] ${
                isLight ? 'text-black/20' : 'text-white/15'
              }`}
            >
              © 2025 | Designed and coded ❤️ by Kha Nguyen
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen App View */}
      <AnimatePresence>
        {activeApp && activeAppData && (
          <motion.div
            key={activeApp}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed inset-0 pt-11 z-[9998] flex flex-col ${
              isLight ? 'bg-white' : 'bg-[#1c1c1e]'
            }`}
          >
            <MobileAppHeader
              title={activeAppData.title}
              glyph={activeAppData.glyph}
              gradient={activeAppData.gradient}
              onBack={() => setActiveApp(null)}
            />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderContent(activeApp)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
