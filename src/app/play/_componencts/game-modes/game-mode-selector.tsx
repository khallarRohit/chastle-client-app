'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GameModeGrid from './game-mode-grid'
import { gameModes } from '@/lib/game-mode/game-mode-data'

export default function GameModeSelector() {
  const [activeTab, setActiveTab] = useState('quick-pairing')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full bg-card border border-border rounded-xl h-14 p-1.5 gap-2">
        <TabsTrigger
          value="quick-pairing"
          className="flex-1 rounded-lg h-full text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-medium transition-all"
        >
          Quick pairing
        </TabsTrigger>
        <TabsTrigger
          value="lobby"
          className="flex-1 rounded-lg h-full text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-medium transition-all"
        >
          Lobby
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="quick-pairing" className="mt-0">
          <GameModeGrid modes={gameModes.quickPairing} />
        </TabsContent>

        <TabsContent value="lobby" className="mt-0">
          <GameModeGrid modes={gameModes.lobby} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
