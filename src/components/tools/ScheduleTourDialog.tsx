import { CalendarCheck, Check, MapPin, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getAgent } from '@/lib/data'
import { useStore } from '@/lib/store'
import type { Listing } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/controls'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/overlay'
import { Avatar } from '@/components/ui/primitives'

const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

/** Next 14 days, excluding Sundays — agents don't do viewings then. */
function upcomingDays() {
  const days: Date[] = []
  for (let i = 1; days.length < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    if (d.getDay() !== 0) days.push(d)
  }
  return days
}

export function ScheduleTourDialog({
  listing,
  children,
}: {
  listing: Listing
  children: React.ReactNode
}) {
  const { addTour } = useStore()
  const agent = getAgent(listing.agentId)
  const days = useMemo(upcomingDays, [])

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'in-person' | 'video'>('in-person')
  const [day, setDay] = useState(days[0].toISOString())
  const [time, setTime] = useState(SLOTS[1])
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Stand-in for the request that would hit the agent's calendar.
    window.setTimeout(() => {
      addTour({ listingId: listing.id, date: day, time, mode, note: note || undefined })
      setSending(false)
      setOpen(false)
      toast.success('Viewing requested', {
        description: `${agent?.name ?? 'The agent'} will confirm shortly.`,
      })
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        title="Book a viewing"
        description={listing.title}
        size="lg"
      >
        <form onSubmit={submit} className="space-y-6 p-6">
          {agent && (
            <div className="bg-surface-2 flex items-center gap-3 rounded-lg p-3">
              <Avatar name={agent.name} src={agent.avatar} className="size-11" />
              <div className="min-w-0">
                <p className="text-default text-sm font-bold">{agent.name}</p>
                <p className="text-muted truncate text-xs">
                  {agent.agency} · usually replies within an hour
                </p>
              </div>
            </div>
          )}

          <Field label="How would you like to view it?">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'in-person', label: 'In person', icon: <MapPin /> },
                { value: 'video', label: 'Video walkthrough', icon: <Video /> },
              ]}
            />
          </Field>

          <Field label="Pick a day">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {days.map((d) => {
                const iso = d.toISOString()
                const active = iso === day
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setDay(iso)}
                    className={cn(
                      'flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 transition-all',
                      active
                        ? 'bg-brand text-on-brand border-transparent shadow-soft'
                        : 'bg-surface border-default text-muted hover:border-strong hover:text-default',
                    )}
                  >
                    <span className="text-[11px] font-semibold uppercase">
                      {d.toLocaleDateString('en-KE', { weekday: 'short' })}
                    </span>
                    <span className="font-display text-lg leading-none font-semibold">
                      {d.getDate()}
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {d.toLocaleDateString('en-KE', { month: 'short' })}
                    </span>
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Pick a time">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SLOTS.map((s) => {
                const active = s === time
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTime(s)}
                    className={cn(
                      'relative rounded-md border py-2 text-sm font-semibold transition-all',
                      active
                        ? 'bg-brand text-on-brand border-transparent shadow-soft'
                        : 'bg-surface border-default text-muted hover:border-strong hover:text-default',
                    )}
                  >
                    {active && <Check className="absolute top-1 right-1 size-3" />}
                    {s}
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor="tour-name">
              <Input id="tour-name" required placeholder="Amos Kiprotich" defaultValue="Amos Kiprotich" />
            </Field>
            <Field label="Phone" htmlFor="tour-phone">
              <Input id="tour-phone" required type="tel" placeholder="+254 7xx xxx xxx" />
            </Field>
          </div>

          <Field
            label="Anything the agent should know?"
            hint="Optional — parking, access, who else is coming."
            htmlFor="tour-note"
          >
            <Textarea
              id="tour-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I'd like to see the service charge breakdown and the water supply arrangement."
            />
          </Field>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={sending}>
              <CalendarCheck /> Request this slot
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
