import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Archive, Bot, CalendarClock, ChevronRight, Sparkles, Users } from 'lucide-react'
import { PageContainer } from '@/components/platform/page-container'
import { PageHeader, type Crumb } from '@/components/platform/page-header'
import { SectionNav } from '@/components/platform/section-nav'
import { EmptyState } from '@/components/platform/states'
import { Timestamp } from '@/components/platform/timestamp'
import { formatCount } from '@/lib/format'
import { CATEGORIES, CATEGORY, contributors, inPeriod, isCategory, ITEMS, itemsOf, PERIODS, WORKER_BY_ID_SAFE, workerLabel, workerScope } from './model'
import { FactStrip, IconTile, ItemList, Panel, PeriodSelect } from './ui'
import { CATEGORY_LOOK } from './look'
import { useFrom, usePeriod, withPeriod } from './nav'

/**
 * One category of learning, for the whole platform (/learning/categories/:category) or for one
 * Worker (/learning/workers/:id/:category). The same screen either way; only the scope changes.
 * New items in the period come first, then what was recorded before.
 */
export function CategoryPage() {
  const { category, id } = useParams()
  const navigate = useNavigate()
  const [period, setPeriod] = usePeriod()
  const worker = id ? WORKER_BY_ID_SAFE(id) : null
  const scoped = id ? itemsOf(id) : ITEMS
  const key = isCategory(category) ? category : null
  const cat = key ? CATEGORY[key] : null
  const from = useFrom(cat ? (worker ? `${workerLabel(id!)} · ${cat.label}` : cat.label) : 'Learning')
  if (!key || !cat || (id && !worker)) return <Navigate to={id && worker ? `/learning/workers/${id}` : '/learning'} replace />

  const items = scoped.filter((i) => i.category === key)
  const fresh = items.filter((i) => inPeriod(i, period))
  const earlier = items.filter((i) => !inPeriod(i, period))
  const periodLabel = PERIODS.find((p) => p.value === period)!.label
  const base = id ? `/learning/workers/${id}` : '/learning/categories'
  const crumbs: Crumb[] = id
    ? [{ label: 'Learning', to: withPeriod('/learning', period) }, { label: workerLabel(id), to: withPeriod(`/learning/workers/${id}`, period) }, { label: cat.label }]
    : [{ label: 'Learning', to: withPeriod('/learning', period) }, { label: 'Learning so far', to: withPeriod('/learning#so-far', period) }, { label: cat.label }]
  const who = contributors(items)
  const look = CATEGORY_LOOK[key]

  return (
    <PageContainer>
      <PageHeader
        crumbs={crumbs}
        title={id ? `${cat.label} · ${workerLabel(id)}` : cat.label}
        utilities={<PeriodSelect value={period} onChange={setPeriod} />}
      />

      <SectionNav
        variant="pills"
        label="Categories"
        value={key}
        onChange={(v) => navigate(withPeriod(`${base}/${v}`, period))}
        items={CATEGORIES.map((c) => ({ value: c.key, label: c.label, count: scoped.filter((i) => i.category === c.key).length }))}
      />

      {items.length === 0 ? (
        <EmptyState icon={look.icon} title={`No ${cat.label.toLowerCase()} recorded yet`} />
      ) : (
        <>
          <FactStrip
            facts={[
              { icon: look.icon, label: cat.label, value: formatCount(items.length) },
              period === 'all' ? { icon: CalendarClock, label: 'Latest', value: <Timestamp iso={items[0].when.iso} /> } : { icon: Sparkles, label: `New in the ${periodLabel.toLowerCase()}`, value: formatCount(fresh.length) },
              id ? { icon: Archive, label: 'Recorded earlier', value: formatCount(earlier.length) } : { icon: Users, label: 'Contributing Workers', value: formatCount(who.length) },
            ]}
          />
          <div className={id ? 'flex flex-col gap-6' : 'grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'}>
            <div className="flex min-w-0 flex-col gap-6">
              <Panel id="fresh" title={period === 'all' ? `All ${cat.label.toLowerCase()}` : `New in the ${periodLabel.toLowerCase()}`} icon={Sparkles} hue="violet" count={fresh.length} flush>
                <ItemList items={fresh} from={from} prefix="n" label={`New ${cat.label.toLowerCase()}`} showWorker={!id} empty={`Nothing new in the ${periodLabel.toLowerCase()}`} />
              </Panel>
              {period !== 'all' && (
                <Panel id="earlier" title="Recorded earlier" icon={Archive} hue="blue" count={earlier.length} flush>
                  <ItemList items={earlier} from={from} prefix="e" label={`Earlier ${cat.label.toLowerCase()}`} showWorker={!id} empty="Nothing earlier" />
                </Panel>
              )}
            </div>

            {!id && (
              <Panel id="contributors" title="Contributing Workers" icon={Users} hue="teal" count={who.length} flush>
                <ul className="divide-y">
                  {who.map((w) => (
                    <li key={w.workerId}>
                      <Link to={withPeriod(`/learning/workers/${w.workerId}/${key}`, period)} className="flex items-center gap-3 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                        <IconTile icon={Bot} hue="blue" size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-item">{w.name}</span>
                          <span className="block truncate text-meta text-muted-foreground">{workerScope(w.workerId)}</span>
                        </span>
                        <span className="rounded-full bg-chip-neutral px-2 py-0.5 text-meta font-medium tabular-nums">{formatCount(w.count)}</span>
                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </>
      )}
    </PageContainer>
  )
}
