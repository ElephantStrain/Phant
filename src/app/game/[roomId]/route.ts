import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, roomId, playerId, roll } = body

    if (action === 'createRoom') {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data: room, error } = await supabase
        .from('game_rooms')
        .insert({ room_code: roomCode, status: 'waiting' })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ room })
    }

    if (action === 'joinRoom') {
      const { roomCode, playerName, color } = body
      
      const { data: room } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single()

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      const { data: player, error } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: playerName,
          color: color || 'blue',
          position: 0
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ room, player })
    }

    if (action === 'startGame') {
      const { error } = await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', roomId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
