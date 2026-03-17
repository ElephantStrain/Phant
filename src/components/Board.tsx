'use client'

import { ELEPHANTS, MUD_SLIDES } from '@/lib/constants'
import { PlayerPiece } from './PlayerPiece'

interface Player {
  id: string
  name: string
  position: number
  color: string
}

interface BoardProps {
  players: Player[]
}

export function Board({ players }: BoardProps) {
  const cells: number[] = []
  for (let row = 9; row >= 0; row--) {
    const start = row * 10 + 1
    const end = start + 9
    if ((9 - row) % 2 === 0) {
      for (let i = start; i <= end; i++) cells.push(i)
    } else {
      for (let i = end; i >= start; i--) cells.push(i)
    }
  }

  const getCellColor = (num: number) => {
    if (num === 100) return 'bg-gradient-to-br from-yellow-300 to-yellow-500'
    if (ELEPHANTS[num]) return 'bg-gradient-to-br from-green-200 to-green-400'
    if (MUD_SLIDES[num]) return 'bg-gradient-to-br from-amber-200 to-amber-400'
    return (Math.floor((num - 1) / 10) + (num - 1)) % 2 === 0
      ? 'bg-amber-50'
      : 'bg-green-50'
  }

  const getCellContent = (num: number) => {
    const playersHere = players.filter(p => p.position === num)
    
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
        <span className={`text-xs font-semibold ${num === 100 ? 'text-yellow-900' : 'text-gray-500'}`}>
          {num}
        </span>
        
        {ELEPHANTS[num] && (
          <span className="text-lg" title={`Elephant to ${ELEPHANTS[num]}`}>🐘</span>
        )}
        {MUD_SLIDES[num] && (
          <span className="text-lg" title={`Mud slide to ${MUD_SLIDES[num]}`}>🌊</span>
        )}
        {num === 100 && <span className="text-lg">👑</span>}
        
        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
          {playersHere.map(player => (
            <PlayerPiece key={player.id} color={player.color} size="xs" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <div className="grid grid-cols-10 gap-1 aspect-square">
        {cells.map((num) => (
          <div
            key={num}
            className={`relative rounded-md ${getCellColor(num)} border border-gray-200`}
          >
            {getCellContent(num)}
          </div>
        ))}
      </div>
    </div>
  )
}
