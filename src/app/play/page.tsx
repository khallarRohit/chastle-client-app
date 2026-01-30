import { Suspense } from 'react'
import GameModeSelector from './_componencts/game-modes/game-mode-selector'
import GameModeActions from './_componencts/game-modes/game-mode-action'
import PlayerStats from './_componencts/game-modes/player-stats'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown } from 'lucide-react'

export default async function PlayPage() {
  const stats = await getPlayerStats()

  return (
    <main className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Play Chess
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Choose your game mode and start playing
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Left Side - Game Modes */}
          <div>
            <GameModeSelector />
          </div>

          {/* Right Side - Actions & Stats */}
          <div className="space-y-5">
            <GameModeActions />
            
            <Suspense fallback={<StatsLoadingSkeleton />}>
              <PlayerStats stats={stats} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}

async function getPlayerStats() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    players: 44344,
    gamesInPlay: 19537,
  }
}

function StatsLoadingSkeleton() {
  return (
    <Card className="bg-card border-border p-5">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full bg-secondary" />
        <Skeleton className="h-16 w-full bg-secondary" />
      </div>
    </Card>
  )
}
