'use client'
import { useRef, useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodeBlock({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const onCopy = async () => {
    const text = ref.current?.innerText ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative group my-4">
      <pre
        ref={ref}
        {...props}
        className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10 p-4 text-sm"
      >
        {children}
      </pre>
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/80 dark:bg-white/10 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy"
      >
        {copied
          ? <Check className="w-3.5 h-3.5 text-emerald-500" />
          : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
