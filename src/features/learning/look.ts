import { BookOpen, PencilRuler, PlayCircle, Repeat, Wrench, type LucideIcon } from 'lucide-react'
import type { Hue } from '@/components/platform/hue'
import type { CategoryKey } from './model'

/** Each category keeps one icon and hue wherever it appears. */
export const CATEGORY_LOOK: Record<CategoryKey, { icon: LucideIcon; hue: Hue }> = {
  experiences: { icon: PlayCircle, hue: 'blue' },
  facts: { icon: BookOpen, hue: 'violet' },
  techniques: { icon: Wrench, hue: 'teal' },
  patterns: { icon: Repeat, hue: 'cyan' },
  'skill-changes': { icon: PencilRuler, hue: 'amber' },
}
