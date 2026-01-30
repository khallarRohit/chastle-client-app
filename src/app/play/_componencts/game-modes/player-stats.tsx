import { Card } from '@/components/ui/card'
import { Users, Gamepad2 } from 'lucide-react'

interface PlayerStatsProps {
  stats: {
    players: number
    gamesInPlay: number
  }
}

export default function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <Card className="bg-card border-border p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-xl font-semibold text-card-foreground">
              {stats.players.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Players online</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-xl font-semibold text-card-foreground">
              {stats.gamesInPlay.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Games in play</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
