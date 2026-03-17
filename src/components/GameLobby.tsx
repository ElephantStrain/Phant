'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
]

export function GameLobby() {
  const router = useRouter()
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const createRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createRoom' })
      })

      const { room, error: apiError } = await response.json()
      
      if (apiError || !room) {
        throw new Error(apiError || 'Failed to create room')
      }

      const joinResponse = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'joinRoom',
          roomCode: room.room_code,
          playerName: playerName.trim(),
          color: selectedColor
        })
      })

      const { player, error: joinError } = await joinResponse.json()

      if (joinError || !player) {
        throw new Error(joinError || 'Failed to join room')
      }

      localStorage.setItem(`player_${room.id}`, JSON.stringify(player))
      router.push(`/game/${room.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'joinRoom',
          roomCode: roomCode.trim().toUpperCase(),
          playerName: playerName.trim(),
          color: selectedColor
        })
      })

      const { room, player, error: apiError } = await response.json()

      if (apiError || !room || !player) {
        throw new Error(apiError || 'Failed to join room')
      }

      localStorage.setItem(`player_${room.id}`, JSON.stringify(player))
      router.push(`/game/${room.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room not found')
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2">🐘 Elephants & Ladders</h1>
        <p className="text-gray-600">A whimsical multiplayer adventure</p>
      </div>

      {mode === 'menu' && (
        <div className="space-y-4">
          <button
            onClick={() => setMode('create')}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            🎮 Create New Game
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            🔗 Join Game
          </button>
        </div>
      )}

      {(mode === 'create' || mode === 'join') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
                maxLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Your Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    selectedColor === color.value
                      ? 'border-gray-800 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={mode === 'create' ? createRoom : joinRoom}
              disabled={isLoading}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-medium transition-colors"
            >
              {isLoading ? 'Loading...' : mode === 'create' ? 'Create' : 'Join'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        🎯 Be the first to reach square 100!
      </div>
    </motion.div>
  )
}
