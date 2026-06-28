import { DocsShell } from '@/components/docs/docs-shell'
import { DocsSearch } from '@/components/docs/docs-search'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocsSearch />
      <DocsShell>{children}</DocsShell>
    </>
  )
}
