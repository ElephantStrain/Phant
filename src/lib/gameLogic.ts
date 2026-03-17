import { ELEPHANTS, MUD_SLIDES } from './constants'

export interface MoveResult {
  newPos: number
  type: 'normal' | 'elephant' | 'mud' | 'win' | 'bounce'
}

export function processMove(position: number, roll: number): MoveResult {
  let newPos = position + roll

  if (newPos > 100) {
    return { newPos: position, type: 'bounce' }
  }

  if (newPos === 100) {
    return { newPos: 100, type: 'win' }
  }

  if (ELEPHANTS[newPos]) {
    return { newPos: ELEPHANTS[newPos], type: 'elephant' }
  }

  if (MUD_SLIDES[newPos]) {
    return { newPos: MUD_SLIDES[newPos], type: 'mud' }
  }

  return { newPos, type: 'normal' }
}
