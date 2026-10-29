import { useSearchParams } from 'react-router'

/** The `?mock=` review scenario (loading, error, empty, slow), or null. */
export function useScenario() {
  const [params] = useSearchParams()
  return params.get('mock')
}
