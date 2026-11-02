import { afterEach, describe, expect, it, vi } from 'vitest'

// A minimal browser storage, so the store's persistence and reset can be checked without a DOM.
function fakeWindow(seed: Record<string, string> = {}) {
  const data = { ...seed }
  return { localStorage: { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v), removeItem: (k: string) => void delete data[k] }, data }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('demo store', () => {
  it('saves actions and restores them on the next load', async () => {
    const w = fakeWindow()
    vi.stubGlobal('window', w)
    const store = await import('./store')
    expect(store.isPersisted()).toBe(true)
    const proposal = store.getDemo().agreements.find((a) => a.status === 'proposed')!
    expect(store.actions.approveAgreement(proposal.id, 'Approved in test').ok).toBe(true)

    vi.resetModules()
    const again = await import('./store')
    expect(again.getDemo().agreements.find((a) => a.id === proposal.id)!.status).toBe('agreed')
  })

  it('reset brings back the starting data', async () => {
    vi.stubGlobal('window', fakeWindow())
    const store = await import('./store')
    const before = store.getDemo().decisions.length
    store.actions.stopWorker(Object.keys(store.getDemo().workers).find((id) => store.getDemo().workers[id].status === 'active')!, 'Test stop')
    expect(store.getDemo().decisions.length).toBeGreaterThan(before)
    store.actions.reset()
    expect(store.getDemo().decisions.length).toBe(before)
  })

  it('ignores unreadable saved data and works without storage', async () => {
    vi.stubGlobal('window', fakeWindow({ 'aiw.sentinel-demo.v1': '{not json' }))
    const store = await import('./store')
    expect(store.getDemo().version).toBe(1)

    vi.resetModules()
    vi.stubGlobal('window', { get localStorage(): Storage { throw new Error('blocked') } })
    const blocked = await import('./store')
    expect(blocked.isPersisted()).toBe(false)
    expect(blocked.getDemo().decisions.length).toBeGreaterThan(0)
  })
})
