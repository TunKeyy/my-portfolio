import { ExternalLink, Lock } from 'lucide-react'

export function SmartLink({ href = '', children, ...rest }: React.ComponentPropsWithoutRef<'a'>) {
  const isExternal = /^https?:\/\//.test(href)
  const isInternalCorp = /vnggames\.atlassian\.net/i.test(href)

  if (!isExternal) return <a href={href} {...rest}>{children}</a>

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest} className="inline-flex items-center gap-1">
      {children}
      {isInternalCorp
        ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
            <Lock className="w-2.5 h-2.5" /> internal
          </span>
        )
        : <ExternalLink className="w-3 h-3 opacity-60" />}
    </a>
  )
}
