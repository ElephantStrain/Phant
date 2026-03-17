'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface DiceProps {
  onRoll: () => void
  disabled: boolean
  isRolling: boolean
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export function Dice({ onRoll, disabled, isRolling }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isRolling])

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Roll the Dice</h2>
      
      <motion.div
        animate={isRolling ? { rotate: [0, 360, 720] } : {}}
        transition={{ duration: 1 }}
        className="text-8xl mb-6 select-none"
      >
        {DICE_FACES[displayValue]}
      </motion.div>

      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${
          disabled || isRolling
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isRolling ? 'Rolling...' : disabled ? 'Wait for your turn' : '🎲 ROLL!'}
      </button>

      <p className="mt-4 text-sm text-gray-500">
        {disabled && !isRolling 
          ? 'Other player\'s turn' 
          : 'Click to roll and move your elephant!'}
      </p>
    </div>
  )
}
