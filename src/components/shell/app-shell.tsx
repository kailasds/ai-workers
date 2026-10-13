import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { PageContainer } from '@/components/platform/page-container'
import { LoadingRegion } from '@/components/platform/states'
import { Skeleton } from '@/components/ui/skeleton'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WorkNotices } from './work-notices'
import { AppSidebar } from './app-sidebar'
import { PageErrorBoundary } from './error-boundary'
import { CommandMenu, useCommandShortcut } from './command-menu'
import { MOCK_SESSION } from '@/lib/session'

export function AppShell() {
  const [commandOpen, setCommandOpen] = useCommandShortcut()

  return (
    <TooltipProvider delayDuration={400}>
      <SidebarProvider style={{ '--sidebar-width': '19.5rem', '--sidebar-width-icon': '4rem' } as React.CSSProperties}>
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <AppSidebar />
        <SidebarInset className="min-w-0 md:peer-data-[variant=inset]:m-3 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-panel md:peer-data-[variant=inset]:shadow-none md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-3">
          {/* Phones: the rail becomes a named Menu button in a slim top bar. */}
          <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
            <SidebarTrigger className="size-10 rounded-block bg-primary-soft text-primary-strong hover:bg-track" aria-label="Menu" />
            <span className="text-[1.0625rem] font-medium">AI Worker</span>
          </div>
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
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
        </SidebarInset>
        <WorkNotices />
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} features={MOCK_SESSION.features} />
      </SidebarProvider>
    </TooltipProvider>
  )
}
