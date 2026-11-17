import { RotateCcw } from 'lucide-react'
import { NEIGHBORHOODS } from '@/lib/data'
import {
  AMENITY_OPTIONS,
  DEFAULT_FILTERS,
  PRICE_BOUNDS,
  TYPE_OPTIONS,
  activeFilterCount,
} from '@/lib/filters'
import type { Filters, ListingType } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckboxField, Chip, Slider, SwitchField } from '@/components/ui/controls'
import { Separator } from '@/components/ui/primitives'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-default text-sm font-bold">{title}</h3>
      {children}
    </section>
  )
}

const BED_OPTIONS = [0, 1, 2, 3, 4, 5]

export function FilterPanel({
  filters,
  onChange,
  counts,
}: {
  filters: Filters
  onChange: (next: Partial<Filters>) => void
  counts?: Record<string, number>
}) {
  const bounds = PRICE_BOUNDS[filters.deal]
  const active = activeFilterCount(filters)

  const toggleIn = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">
          {active > 0 ? `${active} filter${active > 1 ? 's' : ''} applied` : 'No filters applied'}
        </p>
        <Button
          variant="ghost"
          size="xs"
          disabled={active === 0}
          onClick={() =>
            onChange({ ...DEFAULT_FILTERS, q: filters.q, deal: filters.deal, sort: filters.sort })
          }
        >
          <RotateCcw /> Reset
        </Button>
      </div>

      <Separator />

      <Section title="Property type">
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => (
            <Chip
              key={t.value}
              active={filters.types.includes(t.value)}
              onClick={() => onChange({ types: toggleIn<ListingType>(filters.types, t.value) })}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title={filters.deal === 'rent' ? 'Monthly rent' : 'Price'}>
        <div className="text-muted flex items-center justify-between text-sm font-semibold tabular-nums">
          <span>{formatPrice(filters.min)}</span>
          <span>
            {filters.max >= bounds.max ? `${formatPrice(bounds.max)}+` : formatPrice(filters.max)}
          </span>
        </div>
        <Slider
          value={[filters.min, filters.max]}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          minStepsBetweenThumbs={1}
          onValueChange={([min, max]) => onChange({ min, max })}
          aria-label="Price range"
        />
      </Section>

      <Separator />

      <Section title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {BED_OPTIONS.map((b) => (
            <Chip key={b} active={filters.beds === b} onClick={() => onChange({ beds: b })}>
              {b === 0 ? 'Any' : `${b}+`}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Bathrooms">
        <div className="flex flex-wrap gap-2">
          {BED_OPTIONS.slice(0, 5).map((b) => (
            <Chip key={b} active={filters.baths === b} onClick={() => onChange({ baths: b })}>
              {b === 0 ? 'Any' : `${b}+`}
            </Chip>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Minimum internal area">
        <div className="text-muted text-sm font-semibold tabular-nums">
          {filters.minArea === 0 ? 'Any size' : `${filters.minArea} m² and up`}
        </div>
        <Slider
          value={[filters.minArea]}
          min={0}
          max={600}
          step={10}
          onValueChange={([v]) => onChange({ minArea: v })}
          aria-label="Minimum area"
        />
      </Section>

      <Separator />

      <Section title="Neighbourhood">
        <div className="-my-1 max-h-60 overflow-y-auto pr-1">
          {NEIGHBORHOODS.map((n) => (
            <CheckboxField
              key={n.id}
              label={n.name}
              count={counts?.[n.name]}
              checked={filters.neighborhoods.includes(n.name)}
              onCheckedChange={() =>
                onChange({ neighborhoods: toggleIn(filters.neighborhoods, n.name) })
              }
            />
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Amenities">
        <div className="-my-1">
          {AMENITY_OPTIONS.map((a) => (
            <CheckboxField
              key={a}
              label={a}
              checked={filters.amenities.includes(a)}
              onCheckedChange={() => onChange({ amenities: toggleIn(filters.amenities, a) })}
            />
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Other">
        <div className="space-y-4">
          <SwitchField
            label="Furnished"
            description="Move-in ready with furniture included"
            checked={filters.furnished}
            onCheckedChange={(v) => onChange({ furnished: v })}
          />
          <SwitchField
            label="Pet friendly"
            checked={filters.petFriendly}
            onCheckedChange={(v) => onChange({ petFriendly: v })}
          />
          <SwitchField
            label="Has a 3D tour"
            description="Walk through before you drive out"
            checked={filters.tour3d}
            onCheckedChange={(v) => onChange({ tour3d: v })}
          />
        </div>
      </Section>
    </div>
  )
}
