import { useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Back to the previous page. With in-app history it steps back; opened fresh (a link, a reload)
 * it goes to `fallback`, the parent page; with neither it is not shown.
 */
export function BackButton({ fallback }: { fallback?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== 'default'
  if (!hasHistory && !fallback) return null
  return (
    <Button
      variant="outline"
      size="icon"
      className="shrink-0"
      aria-label="Back"
      title="Back"
      onClick={() => (hasHistory ? navigate(-1) : navigate(fallback!))}
    >
      <ArrowLeft aria-hidden="true" />
    </Button>
  )
}
