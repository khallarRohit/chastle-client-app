'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Settings2 } from 'lucide-react'
import type { GameMode } from '@/lib/game-mode/game-mode-data'

interface GameModeGridProps {
  modes: GameMode[]
}

export default function GameModeGrid({ modes }: GameModeGridProps) {
  const router = useRouter()

  const handleModeClick = (mode: GameMode) => {
    if (mode.isCustom) {
      router.push('/play/custom')
    } else {
      router.push(`/play/game?time=${mode.time}&increment=${mode.increment}`)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {modes.map((mode) => (
        <Card
          key={mode.id}
          onClick={() => handleModeClick(mode)}
          className={cn(
            'bg-card border-border cursor-pointer group relative overflow-hidden',
            'hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10',
            'transition-all duration-300',
            'p-6 sm:p-8 flex flex-col items-center justify-center text-center'
          )}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {mode.isCustom ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Settings2 className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-lg font-medium text-card-foreground">
                Custom
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl font-light text-card-foreground mb-1.5 group-hover:text-foreground transition-colors tracking-tight">
                {mode.time}
                <span className="text-muted-foreground mx-0.5">+</span>
                {mode.increment}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground group-hover:text-primary transition-colors font-medium">
                {mode.category}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
