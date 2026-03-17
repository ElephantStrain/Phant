'use client'

interface PlayerPieceProps {
  color: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

export function PlayerPiece({ color, size = 'md' }: PlayerPieceProps) {
  return (
    <div
      className={`${SIZE_MAP[size]} rounded-full border-2 border-white shadow-md flex items-center justify-center`}
      style={{ backgroundColor: color }}
      title="Player"
    >
      {size !== 'xs' && <span className="text-white text-xs">🐘</span>}
    </div>
  )
}
