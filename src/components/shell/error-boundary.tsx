import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { ErrorState } from '@/components/platform/states'
import { PageContainer } from '@/components/platform/page-container'

interface Props {
  children: ReactNode
  /** Changing this clears a caught error, so navigating away recovers the shell. */
  resetKey: string
}

class Boundary extends Component<Props, { error: Error | null; key: string }> {
  state = { error: null as Error | null, key: this.props.resetKey }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: { error: Error | null; key: string }) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <PageContainer>
        <ErrorState title="This page could not load." message="Reload the page, or choose another section. Nothing you have saved was lost." onRetry={() => window.location.reload()} />
      </PageContainer>
    )
  }
}

// P: a page error never takes the rail down with it.
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <Boundary resetKey={pathname}>{children}</Boundary>
}
