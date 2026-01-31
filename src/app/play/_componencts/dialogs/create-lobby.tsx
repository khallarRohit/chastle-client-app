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
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Crown, Users } from 'lucide-react'
import { IncrementalCache } from 'next/dist/server/lib/incremental-cache'
import { LoadingSwap } from '@/components/ui/loading-swap'
import { createGame } from '../actions/createGame'

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
]

interface CreateLobbyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Side = 'black' | 'random' | 'white'


export function CreateLobbyDialog({ open, onOpenChange }: CreateLobbyDialogProps) {
  const router = useRouter()

  const [variant, setVariant] = useState('standard')
  const [minutes, setMinutes] = useState(5)
  const [increment, setIncrement] = useState(3)
  const [side, setSide] = useState<Side>('random')
  const [rated, setRated] = useState(true)
  const [isPending, setIsPending] = useState(false)

  const selectedPreset = TIME_PRESETS.find(
    (p) => p.minutes === minutes && p.increment === increment
  )

  const handlePresetClick = (preset: typeof TIME_PRESETS[0]) => {
    setMinutes(preset.minutes)
    setIncrement(preset.increment)
  }

//   const handleCreateGame = () => {
//     router.push(`/game?mode=lobby&variant=${variant}&time=${minutes}&inc=${increment}`)
//     onOpenChange(false)
//   }

  const selectedVariant = VARIANTS.find((v) => v.value === variant)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center text-foreground">
            Game setup
          </DialogTitle>
        </DialogHeader>

        <form 
          action={async (formData) => {
            setIsPending(true);
            await createGame(formData);
          }}
          className="space-y-6 pt-4"
        >
          {/* HIDDEN INPUTS: This is how we pass state to the formData */}
          <input type="hidden" name="minutes" value={minutes} />
          <input type="hidden" name="increment" value={increment} />
          <input type="hidden" name="side" value={side} />
          <input type="hidden" name="rated" value={rated ? 1 : 0} />

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

          {/* Time controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Minutes per side</span>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-foreground font-bold">
                  {minutes}
                </span>
                <span className="text-muted-foreground">+</span>
                <span className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-foreground font-bold">
                  {increment}
                </span>
              </div>
              <span className="text-muted-foreground">Increment in seconds</span>
            </div>

            {/* Time presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              {TIME_PRESETS.map((preset) => (
                <button
                  type="button"
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

          {/* Side picker */}
          <div className="space-y-3">
            <p className="text-center text-muted-foreground text-sm">Side</p>
            <div className="grid grid-cols-3 gap-2">
              {(['black', 'random', 'white'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                    side === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  <svg
                    viewBox="0 0 45 45"
                    className="w-8 h-8"
                    fill="currentColor"
                  >
                    {s === 'random' ? (
                      <>
                        <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
                          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="currentColor" strokeLinecap="butt" strokeLinejoin="miter" />
                          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="currentColor" />
                          <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
                        </g>
                      </>
                    ) : (
                      <g fill={s === 'white' ? 'none' : 'currentColor'} fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
                        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={s === 'white' ? '#fff' : 'currentColor'} strokeLinecap="butt" strokeLinejoin="miter" />
                        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill={s === 'white' ? '#fff' : 'currentColor'} />
                        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
                      </g>
                    )}
                  </svg>
                  <span className="text-sm font-medium capitalize">
                    {s === 'random' ? 'Random side' : s}
                  </span>
                </button>
              ))}
            </div>
          </div>

            {/* Rated toggle */}
          <div className="space-y-3">
            <p className="text-center text-muted-foreground text-sm">Game mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRated(true)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                  rated
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-medium">Rated</span>
              </button>
              <button
                type="button"
                onClick={() => setRated(false)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                  !rated
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                </svg>
                <span className="font-medium">Casual</span>
              </button>
            </div>
          </div>


          {/* Create button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
            size="lg"
          >
            <LoadingSwap isLoading={isPending}>
                <span className="flex items-center justify-center gap-2 w-full">
                  <Users className="w-5 h-5 text-primary" />
                  Create lobby game
                </span>            
            </LoadingSwap>
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
