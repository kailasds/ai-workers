import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { PageContainer } from '@/components/platform/page-container'
import { LoadingRegion } from '@/components/platform/states'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WorkNotices } from './work-notices'
import { AppNavbar } from './app-navbar'
import { PageErrorBoundary } from './error-boundary'
import { CommandMenu, useCommandShortcut } from './command-menu'
import { MOCK_SESSION } from '@/lib/session'

// design.md §6, framed: the white frame holds the navbar, and the content sits in the pale panel
// inset from it with a 24px radius.
export function AppShell() {
  const [commandOpen, setCommandOpen] = useCommandShortcut()

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <AppNavbar onOpenCommand={() => setCommandOpen(true)} />
        <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col bg-background outline-none sm:mx-3 sm:mb-3 sm:rounded-panel">
          <PageErrorBoundary>
            <Suspense
              fallback={
                <PageContainer>
                  <LoadingRegion label="Loading…" className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-64 w-full" />
                  </LoadingRegion>
                </PageContainer>
              }
            >
              <Outlet />
            </Suspense>
          </PageErrorBoundary>
        </main>
        <WorkNotices />
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} features={MOCK_SESSION.features} />
      </div>
    </TooltipProvider>
  )
}
