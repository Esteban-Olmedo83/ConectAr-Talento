'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AtsScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

function getScoreConfig(score: number): {
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  label: string
} {
  if (score >= 81) {
    return {
      color: '#22c55e',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      label: 'Excelente',
    }
  }
  if (score >= 61) {
    return {
      color: '#3b82f6',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      label: 'Bueno',
    }
  }
  if (score >= 40) {
    return {
      color: '#f59e0b',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      label: 'Regular',
    }
  }
  return {
    color: '#ef4444',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-500',
    textColor: 'text-red-700 dark:text-red-400',
    label: 'Bajo',
  }
}

export function AtsScoreBadge({
  score,
  size = 'md',
  showLabel = false,
  animated = false,
  className,
}: AtsScoreBadgeProps) {
  const clamped = Math.min(100, Math.max(0, score))
  const config = getScoreConfig(clamped)

  // Small: pill badge
  if (size === 'sm') {
    return (
      <div className={cn('inline-flex flex-col items-center gap-0.5', className)}>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold border',
            config.bgColor,
            config.borderColor,
            config.textColor
          )}
        >
          {clamped}
        </span>
        {showLabel && (
          <span className={cn('text-xs font-medium', config.textColor)}>{config.label}</span>
        )}
      </div>
    )
  }

  // Large: bigger donut
  const circleSize = size === 'lg' ? 72 : 52
  const strokeWidth = size === 'lg' ? 6 : 5
  const radius = (circleSize - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clamped / 100) * circumference
  const fontSize = size === 'lg' ? 'text-lg' : 'text-sm'

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: circleSize, height: circleSize }}
      >
        <svg
          width={circleSize}
          height={circleSize}
          className={cn('-rotate-90', animated && 'transition-all duration-700')}
          viewBox={`0 0 ${circleSize} ${circleSize}`}
        >
          {/* Background track */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress arc */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(animated && 'transition-all duration-700 ease-out')}
          />
        </svg>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold',
            fontSize,
            config.textColor
          )}
        >
          {clamped}
        </span>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold', config.textColor)}>{config.label}</span>
      )}
    </div>
  )
}
