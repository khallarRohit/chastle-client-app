'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, Monitor } from 'lucide-react'

const TIME_PRESETS = [
  { label: '1+0', minutes: 1, increment: 0 },
  { label: '2+1', minutes: 2, increment: 1 },
  { label: '3+0', minutes: 3, increment: 0 },
  { label: '3+2', minutes: 3, increment: 2 },
  { label: '5+0', minutes: 5, increment: 0 },
  { label: '5+3', minutes: 5, increment: 3 },
  { label: '10+0', minutes: 10, increment: 0 },
  { label: '10+5', minutes: 10, increment: 5 },
  { label: '15+10', minutes: 15, increment: 10 },
  { label: '30+0', minutes: 30, increment: 0 },
  { label: '30+20', minutes: 30, increment: 20 },
]

const VARIANTS = [
  { value: 'standard', label: 'Standard', description: 'Standard rules of chess (FIDE)' },
  { value: 'chess960', label: 'Chess960', description: 'Randomized starting position' },
  { value: 'kingOfTheHill', label: 'King of the Hill', description: 'Get your king to the center' },
  { value: 'threeCheck', label: 'Three-check', description: 'Check your opponent 3 times' },
]

const STRENGTH_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8]

type TimeMode = 'realtime' | 'correspondence' | 'unlimited'
type Side = 'black' | 'random' | 'white'

interface PlayComputerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayComputerDialog({ open, onOpenChange }: PlayComputerDialogProps) {
  const router = useRouter()
  const [variant, setVariant] = useState('standard')
  const [timeMode, setTimeMode] = useState<TimeMode>('realtime')
  const [minutes, setMinutes] = useState(5)
  const [increment, setIncrement] = useState(3)
  const [strength, setStrength] = useState(4)
  const [side, setSide] = useState<Side>('random')

  const selectedPreset = TIME_PRESETS.find(
    (p) => p.minutes === minutes && p.increment === increment
  )

  const handlePresetClick = (preset: typeof TIME_PRESETS[0]) => {
    setMinutes(preset.minutes)
    setIncrement(preset.increment)
  }

  const handlePlay = () => {
    const params = new URLSearchParams({
      mode: 'computer',
      variant,
      side,
      timeMode,
      strength: strength.toString(),
    })
    if (timeMode === 'realtime') {
      params.set('time', minutes.toString())
      params.set('inc', increment.toString())
    }
    router.push(`/game?${params.toString()}`)
    onOpenChange(false)
  }

  const selectedVariant = VARIANTS.find((v) => v.value === variant)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center text-foreground">
            Game setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Variant selector */}
          <Select value={variant} onValueChange={setVariant}>
            <SelectTrigger className="w-full bg-secondary border-border">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-muted-foreground" />
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedVariant?.label}</span>
                    <span className="text-muted-foreground text-sm">
                      {selectedVariant?.description}
                    </span>
                  </div>
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {VARIANTS.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{v.label}</span>
                    <span className="text-muted-foreground text-sm">{v.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time mode tabs */}
          <Tabs value={timeMode} onValueChange={(v) => setTimeMode(v as TimeMode)}>
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="realtime" className="flex-1 data-[state=active]:text-primary">
                Real time
              </TabsTrigger>
              <TabsTrigger value="correspondence" className="flex-1 data-[state=active]:text-primary">
                Correspondence
              </TabsTrigger>
              <TabsTrigger value="unlimited" className="flex-1 data-[state=active]:text-primary">
                Unlimited
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Time controls - only show for realtime */}
          {timeMode === 'realtime' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Minutes per side</span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-foreground font-bold">
                    {minutes}
                  </span>
                  <span className="text-muted-foreground">+</span>
                  <span className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-foreground font-bold">
                    {increment}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">Increment in seconds</span>
              </div>

              <div className="flex gap-4">
                <Slider
                  value={[minutes]}
                  onValueChange={(v) => setMinutes(v[0])}
                  min={1}
                  max={60}
                  step={1}
                  className="flex-1"
                />
                <Slider
                  value={[increment]}
                  onValueChange={(v) => setIncrement(v[0])}
                  min={0}
                  max={30}
                  step={1}
                  className="flex-1"
                />
              </div>

              {/* Time presets */}
              <div className="flex flex-wrap gap-2 justify-center">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      selectedPreset?.label === preset.label
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Unlimited message */}
          {timeMode === 'unlimited' && (
            <p className="text-center text-muted-foreground">
              Take all the time you need
            </p>
          )}

          {/* Correspondence message */}
          {timeMode === 'correspondence' && (
            <p className="text-center text-muted-foreground">
              Days per turn - play at your own pace
            </p>
          )}

          {/* Strength selector */}
          <div className="space-y-3">
            <p className="text-center text-muted-foreground font-medium">Strength</p>
            <div className="grid grid-cols-8 gap-1">
              {STRENGTH_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setStrength(level)}
                  className={`py-3 rounded text-sm font-medium transition-colors ${
                    strength === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Side selector */}
          <div className="space-y-3">
            <p className="text-center text-muted-foreground font-medium">Side</p>
            <div className="grid grid-cols-3 gap-2">
              {(['black', 'random', 'white'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-lg transition-colors ${
                    side === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  <svg
                    viewBox="0 0 45 45"
                    className="w-8 h-8"
                    fill={side === s ? 'currentColor' : 'currentColor'}
                  >
                    {s === 'black' ? (
                      <path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" />
                    ) : s === 'white' ? (
                      <path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    ) : (
                      <>
                        <path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
                        <path d="M12.5 37c5.5 3.5 7.25 3.5 10 0v-7s-2-4.5 0-10.5V27v-3.5c0-7.5-6-10.5-10-4-3 6 0 10.5 0 10.5v7" fill="currentColor" />
                        <path d="M22.5 37c2.75 3.5 4.5 3.5 10 0v-7s3-4.5 0-10.5c4-6.5 0-10.5-10-4V27v-3.5c2 6 0 10.5 0 10.5v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </>
                    )}
                  </svg>
                  <span className="text-sm font-medium capitalize">
                    {s === 'random' ? 'Random side' : s}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Play button */}
          <Button
            onClick={handlePlay}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
            size="lg"
          >
            <Monitor className="w-5 h-5 mr-2 text-primary" />
            Play against computer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
