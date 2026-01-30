'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { UserPlus, Cpu, ChevronRight } from 'lucide-react'

const actions = [
  {
    id: 'challenge-friend',
    icon: UserPlus,
    label: 'Challenge a friend',
    description: 'Play with someone you know',
    href: '/play/challenge',
  },
  {
    id: 'play-computer',
    icon: Cpu,
    label: 'Play against computer',
    description: 'Practice against AI',
    href: '/play/computer',
  },
]

export default function GameModeActions() {
  const router = useRouter()

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Card
            key={action.id}
            onClick={() => router.push(action.href)}
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
  )
}
