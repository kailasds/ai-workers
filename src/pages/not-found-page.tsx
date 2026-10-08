import { Link, useLocation } from 'react-router'
import { Compass } from 'lucide-react'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader } from '@/components/platform/page-header'
import { EmptyState } from '@/components/platform/states'
import { Button } from '@/components/ui/button'
import { ALL_NAV_ITEMS, isActivePath } from '@/components/shell/nav'

export function NotFoundPage() {
  const { pathname } = useLocation()
  const nearest = ALL_NAV_ITEMS.filter((item) => isActivePath(pathname, item.to)).sort((a, b) => b.to.length - a.to.length)[0]
  const target = nearest ?? { label: 'Dashboard', to: '/dashboard' }
  return (
    <PageContainer>
      <PageHeader title="Page not found" />
      <EmptyState
        icon={Compass}
        title={`Nothing in the console is at ${pathname}`}
        description="The link may be old, or the page may have moved."
        action={
          <Button asChild variant="outline">
            <Link to={target.to}>Go to {target.label}</Link>
          </Button>
        }
      />
    </PageContainer>
  )
}
