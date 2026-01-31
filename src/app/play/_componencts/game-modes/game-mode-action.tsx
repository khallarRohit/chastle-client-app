'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { UserPlus, Cpu, Users, ChevronRight } from 'lucide-react'
import { CreateLobbyDialog } from '../dialogs/create-lobby'
import { ChallengeFriendDialog } from '../dialogs/challenge-friend'
import { PlayComputerDialog } from '../dialogs/play-computer'

type DialogType = 'lobby' | 'friend' | 'computer' | null

const actions = [
  {
    id: 'lobby' as const,
    icon: Users,
    label: 'Create lobby game',
    description: 'Create a game and wait for opponent',
  },
  {
    id: 'friend' as const,
    icon: UserPlus,
    label: 'Challenge a friend',
    description: 'Play with someone you know',
  },
  {
    id: 'computer' as const,
    icon: Cpu,
    label: 'Play against computer',
    description: 'Practice against AI',
  },
]

export default function GameModeActions() {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)

  return (
    <>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Card
              key={action.id}
              onClick={() => setOpenDialog(action.id)}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary group-hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0">
                <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-card-foreground group-hover:text-foreground transition-colors font-medium block">
                  {action.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {action.description}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Card>
          )
        })}
      </div>

      {/* Dialogs */}
      <CreateLobbyDialog 
        open={openDialog === 'lobby'} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <ChallengeFriendDialog 
        open={openDialog === 'friend'} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <PlayComputerDialog 
        open={openDialog === 'computer'} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
    </>
  )
}
