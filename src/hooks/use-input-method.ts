import { useEffect, useState } from 'react'

type InputMethod = 'touch' | 'pointer' | 'unknown'

/**
 * Detects the primary input method (touch vs. pointer/mouse).
 * Allows responsive hover/touch state handling without media queries.
 *
 * Usage:
 * const inputMethod = useInputMethod()
 * if (inputMethod === 'touch') { // disable hover effects }
 */
export function useInputMethod(): InputMethod {
  const [inputMethod, setInputMethod] = useState<InputMethod>('unknown')

  useEffect(() => {
    // Check for touch capability
    const isTouchDevice = () => {
      return (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints > 0)
      )
    }

    // Detect from first user input
    const handleTouchStart = () => {
      setInputMethod('touch')
      document.removeEventListener('touchstart', handleTouchStart)
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        setInputMethod('pointer')
        document.removeEventListener('pointerdown', handlePointerDown)
      }
    }

    // Initial detection
    if (isTouchDevice()) {
      setInputMethod('touch')
    } else {
      setInputMethod('pointer')
    }

    // Refine based on actual interaction
    document.addEventListener('touchstart', handleTouchStart, { once: true })
    document.addEventListener('pointerdown', handlePointerDown, { once: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  return inputMethod
}
