import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionDialog, type ActionSpec } from '@/features/sentinel/ui'
import { proposedChanges } from './journey'
import { workerLabel, type LearningItem } from './model'
import { reviewSkillChange } from './reviews'

/** Approve or decline a proposed Skill change, each through the one confirmation with a reason. */
export function ReviewActions({ item, size = 'default' }: { item: LearningItem; size?: 'default' | 'sm' }) {
  const [spec, setSpec] = useState<ActionSpec | null>(null)
  const n = proposedChanges(item)
  const what = `${n} proposed Skill ${n === 1 ? 'change' : 'changes'} from ${workerLabel(item.workerId)}`
  return (
    <>
      <Button
        size={size}
        onClick={() => setSpec({
          title: `Approve ${n === 1 ? 'the change' : `${n} changes`}`,
          consequences: [`Marks the ${what} as approved.`, 'Nothing changes in the Skill here; an approved change ships in a new Worker revision.', 'Simulated: saved in this browser only.'],
          confirmLabel: 'Approve',
          run: (r) => reviewSkillChange(item, 'approved', r),
          done: 'Skill changes approved',
        })}
      >
        <Check aria-hidden="true" />Approve
      </Button>
      <Button
        size={size}
        variant="outline"
        onClick={() => setSpec({
          title: `Decline ${n === 1 ? 'the change' : `${n} changes`}`,
          consequences: [`Closes the ${what}.`, 'The Skill stays as it is.', 'Simulated: saved in this browser only.'],
          confirmLabel: 'Decline',
          destructive: true,
          run: (r) => reviewSkillChange(item, 'declined', r),
          done: 'Skill changes declined',
        })}
      >
        <X aria-hidden="true" />Decline
      </Button>
      <ActionDialog spec={spec} onClose={() => setSpec(null)} />
    </>
  )
}
