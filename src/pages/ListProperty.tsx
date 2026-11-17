import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  ImagePlus,
  MapPin,
  PartyPopper,
  Ruler,
  Sparkles,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AREA_NAMES } from '@/lib/data'
import { TYPE_OPTIONS, AMENITY_OPTIONS } from '@/lib/filters'
import type { ListingType } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Chip, Segmented, Select, SwitchField } from '@/components/ui/controls'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Card, Progress } from '@/components/ui/primitives'

const STEPS = [
  { id: 'basics', title: 'The basics', icon: <Home />, blurb: 'What are you listing, and where?' },
  { id: 'details', title: 'Details', icon: <Ruler />, blurb: 'Size, rooms and what makes it good.' },
  { id: 'photos', title: 'Photos', icon: <ImagePlus />, blurb: 'The part buyers actually look at.' },
  { id: 'price', title: 'Price & contact', icon: <Wallet />, blurb: 'What you want, and who to call.' },
]

interface Draft {
  deal: 'buy' | 'rent'
  type: ListingType
  area: string
  address: string
  title: string
  description: string
  beds: string
  baths: string
  size: string
  parking: string
  amenities: string[]
  furnished: boolean
  pets: boolean
  photos: number
  price: string
  serviceCharge: string
  name: string
  phone: string
  email: string
}

const EMPTY: Draft = {
  deal: 'buy',
  type: 'apartment',
  area: 'Westlands',
  address: '',
  title: '',
  description: '',
  beds: '2',
  baths: '2',
  size: '',
  parking: '1',
  amenities: [],
  furnished: false,
  pets: false,
  photos: 0,
  price: '',
  serviceCharge: '',
  name: '',
  phone: '',
  email: '',
}

export function ListProperty() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const canContinue = (() => {
    if (step === 0) return draft.address.trim().length > 2 && draft.title.trim().length > 4
    if (step === 1) return draft.size.trim().length > 0 && draft.description.trim().length > 20
    if (step === 2) return draft.photos >= 3
    if (step === 3)
      return (
        draft.price.trim().length > 0 &&
        draft.name.trim().length > 1 &&
        draft.phone.trim().length > 7
      )
    return false
  })()

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setDone(true)
      toast.success('Listing submitted for review', {
        description: 'We verify title and photos within one working day.',
      })
    }, 900)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-brand-soft text-brand mx-auto grid size-20 place-items-center rounded-full"
        >
          <PartyPopper className="size-9" />
        </motion.div>
        <h1 className="font-display text-default mt-6 text-3xl font-semibold tracking-tight">
          That&rsquo;s it — it&rsquo;s with our team
        </h1>
        <p className="text-muted mt-3 text-pretty">
          We&rsquo;ll verify the title and photos within one working day, then push{' '}
          <span className="text-default font-semibold">{draft.title || 'your listing'}</span> to the
          buyers already searching {draft.area}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/dashboard">Go to your dashboard</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(EMPTY)
              setStep(0)
              setDone(false)
            }}
          >
            List another property
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-default text-3xl font-semibold tracking-tight sm:text-4xl">
          List your property
        </h1>
        <p className="text-muted mt-2">
          Four short steps. Most owners finish in under ten minutes.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* ---------------- step rail ---------------- */}
        <aside>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mb-6 lg:hidden" />
          <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
            {STEPS.map((s, i) => {
              const state = i < step ? 'done' : i === step ? 'active' : 'todo'
              return (
                <li key={s.id} className="shrink-0 lg:w-full">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors',
                      state === 'active' && 'bg-brand-soft',
                      state === 'done' && 'hover:bg-surface-2 cursor-pointer',
                      state === 'todo' && 'opacity-50',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold [&_svg]:size-4',
                        state === 'done'
                          ? 'bg-brand text-on-brand'
                          : state === 'active'
                            ? 'bg-brand text-on-brand'
                            : 'bg-surface-2 text-muted',
                      )}
                    >
                      {state === 'done' ? <Check strokeWidth={3} /> : s.icon}
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span
                        className={cn(
                          'block text-sm font-bold',
                          state === 'active' ? 'text-brand' : 'text-default',
                        )}
                      >
                        {s.title}
                      </span>
                      <span className="text-muted block truncate text-xs">{s.blurb}</span>
                    </span>
                    <span className="text-default text-sm font-bold lg:hidden">{s.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* ---------------- form ---------------- */}
        <Card className="p-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {step === 0 && (
              <>
                <Field label="Are you selling or letting?">
                  <Segmented
                    value={draft.deal}
                    onChange={(v) => set('deal', v)}
                    options={[
                      { value: 'buy', label: 'Selling' },
                      { value: 'rent', label: 'Letting' },
                    ]}
                  />
                </Field>

                <Field label="Property type">
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map((t) => (
                      <Chip
                        key={t.value}
                        active={draft.type === t.value}
                        onClick={() => set('type', t.value)}
                      >
                        {t.label}
                      </Chip>
                    ))}
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Neighbourhood">
                    <Select
                      value={draft.area}
                      onChange={(v) => set('area', v)}
                      options={AREA_NAMES.map((a) => ({ value: a, label: a }))}
                      className="w-full"
                      ariaLabel="Neighbourhood"
                    />
                  </Field>
                  <Field label="Street address" htmlFor="lp-address">
                    <Input
                      id="lp-address"
                      value={draft.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="42 Rhapta Road"
                      icon={<MapPin />}
                    />
                  </Field>
                </div>

                <Field
                  label="Listing headline"
                  hint="What a buyer scrolling past would stop for."
                  htmlFor="lp-title"
                >
                  <Input
                    id="lp-title"
                    value={draft.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="Light-filled 3-bed townhouse in Lavington"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-4 sm:grid-cols-4">
                  <Field label="Bedrooms" htmlFor="lp-beds">
                    <Input
                      id="lp-beds"
                      type="number"
                      min={0}
                      value={draft.beds}
                      onChange={(e) => set('beds', e.target.value)}
                    />
                  </Field>
                  <Field label="Bathrooms" htmlFor="lp-baths">
                    <Input
                      id="lp-baths"
                      type="number"
                      min={0}
                      value={draft.baths}
                      onChange={(e) => set('baths', e.target.value)}
                    />
                  </Field>
                  <Field label="Parking" htmlFor="lp-parking">
                    <Input
                      id="lp-parking"
                      type="number"
                      min={0}
                      value={draft.parking}
                      onChange={(e) => set('parking', e.target.value)}
                    />
                  </Field>
                  <Field label="Internal area" htmlFor="lp-size">
                    <Input
                      id="lp-size"
                      type="number"
                      min={0}
                      value={draft.size}
                      onChange={(e) => set('size', e.target.value)}
                      suffix="m²"
                      placeholder="180"
                    />
                  </Field>
                </div>

                <Field
                  label="Description"
                  hint="Be specific. Water supply, backup power and service charge are what people ask first."
                  htmlFor="lp-desc"
                >
                  <Textarea
                    id="lp-desc"
                    value={draft.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Set back from the road on a quiet cul-de-sac, with mature garden, borehole and a generator that covers the whole house…"
                    className="min-h-36"
                  />
                </Field>

                <Field label="Amenities">
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_OPTIONS.map((a) => (
                      <Chip
                        key={a}
                        active={draft.amenities.includes(a)}
                        onClick={() =>
                          set(
                            'amenities',
                            draft.amenities.includes(a)
                              ? draft.amenities.filter((x) => x !== a)
                              : [...draft.amenities, a],
                          )
                        }
                      >
                        {a}
                      </Chip>
                    ))}
                  </div>
                </Field>

                <div className="space-y-4">
                  <SwitchField
                    label="Furnished"
                    checked={draft.furnished}
                    onCheckedChange={(v) => set('furnished', v)}
                  />
                  <SwitchField
                    label="Pets allowed"
                    checked={draft.pets}
                    onCheckedChange={(v) => set('pets', v)}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-default text-sm font-semibold">Photos</h2>
                  <p className="text-muted mt-1 text-xs">
                    At least three, and lead with the exterior. Listings with eight or more photos
                    get roughly twice the enquiries.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => set('photos', Math.min(draft.photos + 3, 12))}
                  className="border-strong hover:border-[var(--brand)] hover:bg-brand-soft flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors"
                >
                  <span className="bg-surface-2 text-brand grid size-14 place-items-center rounded-full">
                    <ImagePlus className="size-6" />
                  </span>
                  <span className="text-default text-sm font-semibold">
                    Drop photos here, or click to browse
                  </span>
                  <span className="text-muted text-xs">JPG or PNG, up to 10 MB each</span>
                </button>

                {draft.photos > 0 && (
                  <>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {Array.from({ length: draft.photos }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="bg-surface-2 border-default relative grid aspect-4/3 place-items-center rounded-lg border"
                        >
                          <span className="text-muted text-xs font-semibold">
                            {i === 0 ? 'Cover' : `Photo ${i + 1}`}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => set('photos', 0)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 /> Remove all
                    </Button>
                  </>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={draft.deal === 'rent' ? 'Monthly rent' : 'Asking price'}
                    htmlFor="lp-price"
                    hint={
                      draft.price
                        ? formatPrice(Number(draft.price) || 0, { compact: false })
                        : undefined
                    }
                  >
                    <Input
                      id="lp-price"
                      type="number"
                      min={0}
                      step={draft.deal === 'rent' ? 1000 : 100000}
                      value={draft.price}
                      onChange={(e) => set('price', e.target.value)}
                      suffix="KSh"
                      placeholder={draft.deal === 'rent' ? '150000' : '24000000'}
                    />
                  </Field>
                  <Field label="Service charge (optional)" htmlFor="lp-sc">
                    <Input
                      id="lp-sc"
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.serviceCharge}
                      onChange={(e) => set('serviceCharge', e.target.value)}
                      suffix="KSh/mo"
                      placeholder="12000"
                    />
                  </Field>
                </div>

                <div className="border-default border-t pt-6">
                  <h2 className="text-default text-sm font-bold">How should buyers reach you?</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" htmlFor="lp-name">
                      <Input
                        id="lp-name"
                        value={draft.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="Amos Kiprotich"
                      />
                    </Field>
                    <Field label="Phone" htmlFor="lp-phone">
                      <Input
                        id="lp-phone"
                        type="tel"
                        value={draft.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        placeholder="+254 7xx xxx xxx"
                      />
                    </Field>
                    <Field label="Email" htmlFor="lp-email" className="sm:col-span-2">
                      <Input
                        id="lp-email"
                        type="email"
                        value={draft.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>
                </div>

                <div className="bg-brand-soft flex gap-3 rounded-lg p-4">
                  <Sparkles className="text-brand mt-0.5 size-5 shrink-0" />
                  <p className="text-default text-sm text-pretty">
                    We&rsquo;ll match your listing against{' '}
                    <span className="font-bold">1,480 active searches</span> in {draft.area} and
                    notify every buyer whose criteria it fits.
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* ---------------- nav ---------------- */}
          <div className="border-default mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              <ArrowLeft /> Back
            </Button>

            <span className="text-muted text-xs font-semibold tabular-nums">
              Step {step + 1} of {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button disabled={!canContinue} loading={submitting} onClick={submit}>
                Submit listing
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
