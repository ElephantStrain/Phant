'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Board } from '@/components/Board'
import { Dice } from '@/components/Dice'
import { PlayerPiece } from '@/components/PlayerPiece'
import { supabase } from '@/lib/supabase'
import { processMove } from '@/lib/gameLogic'

interface Player {
  id: string
  name: string
  position: number
  color: string
}

interface GameRoom {
  id: string
  room_code: string
  status: string
  current_turn: number
  winner_id: string | null
}

export default function GameRoom() {
  const { roomId } = useParams()
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [gameLog, setGameLog] = useState<string[]>([])

  useEffect(() => {
    if (!roomId) return

    const fetchRoom = async () => {
      const { data: roomData } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single()
      
      if (roomData) setRoom(roomData)
    }

    const fetchPlayers = async () => {
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
      
      if (playersData) setPlayers(playersData)
    }

    fetchRoom()
    fetchPlayers()

    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        setRoom(payload.new as GameRoom)
      })
      .subscribe()

    const playersChannel = supabase
      .channel(`players:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`
      }, async () => {
        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
        if (data) setPlayers(data)
      })
      .subscribe()

    const storedPlayer = localStorage.getItem(`player_${roomId}`)
    if (storedPlayer) {
      setCurrentPlayer(JSON.parse(storedPlayer))
    }

    return () => {
      roomChannel.unsubscribe()
      playersChannel.unsubscribe()
    }
  }, [roomId])

  const handleRoll = async () => {
    if (!currentPlayer || !room || isRolling) return
    
    const currentTurnPlayer = players[room.current_turn % players.length]
    if (currentTurnPlayer.id !== currentPlayer.id) {
      alert("It's not your turn!")
      return
    }

    setIsRolling(true)
    const roll = Math.floor(Math.random() * 6) + 1
    
    setTimeout(async () => {
      const move = processMove(currentPlayer.position, roll)
      
      const { error } = await supabase
        .from('players')
        .update({ position: move.newPos })
        .eq('id', currentPlayer.id)

      if (error) {
        console.error('Error updating position:', error)
        setIsRolling(false)
        return
      }

      await supabase.from('game_moves').insert({
        room_id: roomId,
        player_id: currentPlayer.id,
        dice_roll: roll,
        from_position: currentPlayer.position,
        to_position: move.newPos,
        move_type: move.type
      })

      const logEntry = `${currentPlayer.name} rolled ${roll}: ${move.type === 'elephant' ? '🐘 Elephant lift!' : move.type === 'mud' ? '😰 Mud slide!' : `moved to ${move.newPos}`}`
      setGameLog(prev => [logEntry, ...prev].slice(0, 5))

      if (move.type === 'win') {
        await supabase
          .from('game_rooms')
          .update({ status: 'finished', winner_id: currentPlayer.id })
          .eq('id', roomId)
      } else {
        await supabase
          .from('game_rooms')
          .update({ current_turn: room.current_turn + 1 })
          .eq('id', roomId)
      }

      const updatedPlayer = { ...currentPlayer, position: move.newPos }
      setCurrentPlayer(updatedPlayer)
      localStorage.setItem(`player_${roomId}`, JSON.stringify(updatedPlayer))

      setIsRolling(false)
    }, 1000)
  }

  if (!room) return <div className="p-8">Loading game...</div>

  const currentTurnPlayer = players[room.current_turn % players.length]
  const isMyTurn = currentPlayer?.id === currentTurnPlayer?.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800">🐘 Elephants & Ladders</h1>
            <p className="text-green-600">Room: {room.room_code}</p>
          </div>
          <div className="text-right">
            {room.status === 'finished' ? (
              <div className="text-2xl font-bold text-amber-600">
                🎉 {players.find(p => p.id === room.winner_id)?.name} Wins!
              </div>
            ) : (
              <div className="text-lg">
                <span className="text-gray-600">Current turn: </span>
                <span className="font-semibold" style={{ color: currentTurnPlayer?.color }}>
                  {currentTurnPlayer?.name}
                </span>
                {isMyTurn && <span className="ml-2 text-green-600 font-bold">(Your turn!)</span>}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Board players={players} />
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Players</h2>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3">
                    <PlayerPiece color={player.color} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: player.color }}>
                        {player.name}
                        {index === room.current_turn % players.length && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            TURN
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Position: {player.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <Dice 
                onRoll={handleRoll} 
                disabled={!isMyTurn || room.status === 'finished' || isRolling}
                isRolling={isRolling}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Moves</h2>
              <div className="space-y-2 text-sm">
                {gameLog.length === 0 ? (
                  <p className="text-gray-400 italic">No moves yet...</p>
                ) : (
                  gameLog.map((log, i) => (
                    <div key={i} className="text-gray-600">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
