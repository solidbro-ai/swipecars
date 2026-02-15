'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  X,
  ChevronDown,
  Save,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CAR_MAKES,
  CAR_MODELS,
  CAR_CONDITIONS,
  CAR_FEATURES,
  YEAR_MIN,
  YEAR_MAX,
  PRICE_MIN,
  PRICE_MAX,
  MILEAGE_MIN,
  MILEAGE_MAX,
  DEFAULT_FILTERS,
} from '@/lib/constants'
import { CarFilters, FilterPresetWithFilters } from '@/types'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: CarFilters
  onChange: (filters: CarFilters) => void
  onReset: () => void
  presets?: FilterPresetWithFilters[]
  onSavePreset?: (name: string, filters: CarFilters) => void
  onDeletePreset?: (presetId: string) => void
  onLoadPreset?: (preset: FilterPresetWithFilters) => void
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  presets = [],
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['price', 'year', 'make'])
  )

  const availableModels = filters.makes?.length
    ? filters.makes.flatMap((make) => CAR_MODELS[make] || [])
    : []

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters)
      setPresetName('')
      setShowSavePreset(false)
    }
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0
    if (key === 'yearMin') return value !== YEAR_MIN
    if (key === 'yearMax') return value !== YEAR_MAX
    if (key === 'priceMin') return value !== PRICE_MIN
    if (key === 'priceMax') return value !== PRICE_MAX
    if (key === 'mileageMin') return value !== MILEAGE_MIN
    if (key === 'mileageMax') return value !== MILEAGE_MAX
    return value !== undefined && value !== ''
  }).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Presets */}
          {(presets.length > 0 || onSavePreset) && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-medium">Saved Presets</Label>
                {onSavePreset && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSavePreset(!showSavePreset)}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save Current
                  </Button>
                )}
              </div>
              
              <AnimatePresence>
                {showSavePreset && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-3 flex gap-2"
                  >
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSavePreset}>
                      Save
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Badge
                      key={preset.id}
                      variant="outline"
                      className="cursor-pointer gap-1 pr-1 hover:bg-secondary"
                      onClick={() => onLoadPreset?.(preset)}
                    >
                      {preset.name}
                      {onDeletePreset && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeletePreset(preset.id)
                          }}
                          className="ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
              <Separator className="my-4" />
            </div>
          )}

          {/* Price Range */}
          <FilterSection
            title="Price Range"
            expanded={expandedSections.has('price')}
            onToggle={() => toggleSection('price')}
          >
            <div className="space-y-4">
              <Slider
                value={[filters.priceMin || PRICE_MIN, filters.priceMax || PRICE_MAX]}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={1000}
                onValueChange={([min, max]) =>
                  onChange({ ...filters, priceMin: min, priceMax: max })
                }
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={filters.priceMin || ''}
                  onChange={(e) =>
                    onChange({ ...filters, priceMin: Number(e.target.value) || undefined })
                  }
                  placeholder="Min"
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  value={filters.priceMax || ''}
                  onChange={(e) =>
                    onChange({ ...filters, priceMax: Number(e.target.value) || undefined })
                  }
                  placeholder="Max"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatPrice(filters.priceMin || PRICE_MIN)} -{' '}
                {formatPrice(filters.priceMax || PRICE_MAX)}
              </p>
            </div>
          </FilterSection>

          {/* Year Range */}
          <FilterSection
            title="Year"
            expanded={expandedSections.has('year')}
            onToggle={() => toggleSection('year')}
          >
            <div className="flex items-center gap-2">
              <Select
                value={filters.yearMin?.toString() || ''}
                onValueChange={(v) =>
                  onChange({ ...filters, yearMin: Number(v) || undefined })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MAX - i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">to</span>
              <Select
                value={filters.yearMax?.toString() || ''}
                onValueChange={(v) =>
                  onChange({ ...filters, yearMax: Number(v) || undefined })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MAX - i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </FilterSection>

          {/* Make */}
          <FilterSection
            title="Make"
            expanded={expandedSections.has('make')}
            onToggle={() => toggleSection('make')}
          >
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {CAR_MAKES.map((make) => (
                <label
                  key={make}
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-secondary"
                >
                  <Checkbox
                    checked={filters.makes?.includes(make)}
                    onCheckedChange={(checked) => {
                      const makes = filters.makes || []
                      onChange({
                        ...filters,
                        makes: checked
                          ? [...makes, make]
                          : makes.filter((m) => m !== make),
                        models: checked ? filters.models : filters.models?.filter(
                          (m) => !CAR_MODELS[make]?.includes(m)
                        ),
                      })
                    }}
                  />
                  <span className="text-sm">{make}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Model (only if makes selected) */}
          {availableModels.length > 0 && (
            <FilterSection
              title="Model"
              expanded={expandedSections.has('model')}
              onToggle={() => toggleSection('model')}
            >
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableModels.map((model) => (
                  <label
                    key={model}
                    className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-secondary"
                  >
                    <Checkbox
                      checked={filters.models?.includes(model)}
                      onCheckedChange={(checked) => {
                        const models = filters.models || []
                        onChange({
                          ...filters,
                          models: checked
                            ? [...models, model]
                            : models.filter((m) => m !== model),
                        })
                      }}
                    />
                    <span className="text-sm">{model}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Mileage */}
          <FilterSection
            title="Mileage"
            expanded={expandedSections.has('mileage')}
            onToggle={() => toggleSection('mileage')}
          >
            <div className="space-y-4">
              <Slider
                value={[filters.mileageMin || MILEAGE_MIN, filters.mileageMax || MILEAGE_MAX]}
                min={MILEAGE_MIN}
                max={MILEAGE_MAX}
                step={5000}
                onValueChange={([min, max]) =>
                  onChange({ ...filters, mileageMin: min, mileageMax: max })
                }
              />
              <p className="text-sm text-muted-foreground">
                {(filters.mileageMin || MILEAGE_MIN).toLocaleString()} -{' '}
                {(filters.mileageMax || MILEAGE_MAX).toLocaleString()} miles
              </p>
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection
            title="Condition"
            expanded={expandedSections.has('condition')}
            onToggle={() => toggleSection('condition')}
          >
            <div className="flex flex-wrap gap-2">
              {CAR_CONDITIONS.map((condition) => (
                <Badge
                  key={condition.value}
                  variant={filters.conditions?.includes(condition.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const conditions = filters.conditions || []
                    onChange({
                      ...filters,
                      conditions: conditions.includes(condition.value)
                        ? conditions.filter((c) => c !== condition.value)
                        : [...conditions, condition.value],
                    })
                  }}
                >
                  {filters.conditions?.includes(condition.value) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {condition.label}
                </Badge>
              ))}
            </div>
          </FilterSection>

          {/* Features */}
          <FilterSection
            title="Features"
            expanded={expandedSections.has('features')}
            onToggle={() => toggleSection('features')}
          >
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {CAR_FEATURES.map((feature) => (
                <Badge
                  key={feature}
                  variant={filters.features?.includes(feature) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const features = filters.features || []
                    onChange({
                      ...filters,
                      features: features.includes(feature)
                        ? features.filter((f) => f !== feature)
                        : [...features, feature],
                    })
                  }}
                >
                  {filters.features?.includes(feature) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {feature}
                </Badge>
              ))}
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection
            title="Location"
            expanded={expandedSections.has('location')}
            onToggle={() => toggleSection('location')}
          >
            <div className="space-y-3">
              <Input
                placeholder="City, State or ZIP"
                value={filters.location || ''}
                onChange={(e) => onChange({ ...filters, location: e.target.value })}
              />
              <div>
                <Label className="text-sm">Distance: {filters.distance || 100} miles</Label>
                <Slider
                  value={[filters.distance || 100]}
                  min={10}
                  max={500}
                  step={10}
                  onValueChange={([distance]) => onChange({ ...filters, distance })}
                  className="mt-2"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="gradient" className="flex-1" onClick={() => setOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface FilterSectionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, expanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="rounded-lg border">
      <button
        className="flex w-full items-center justify-between p-3 text-left font-medium hover:bg-secondary/50"
        onClick={onToggle}
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
