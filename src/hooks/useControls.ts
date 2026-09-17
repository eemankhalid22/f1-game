import { useEffect, useState, useCallback } from 'react'

interface ControlsState {
  moveLeft: boolean
  moveRight: boolean
}

export const useControls = () => {
  const [controls, setControls] = useState<ControlsState>({
    moveLeft: false,
    moveRight: false,
  })

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      setControls((prev) => ({ ...prev, moveLeft: true }))
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      setControls((prev) => ({ ...prev, moveRight: true }))
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      setControls((prev) => ({ ...prev, moveLeft: false }))
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      setControls((prev) => ({ ...prev, moveRight: false }))
    }
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const screenWidth = window.innerWidth

    if (touch.clientX < screenWidth / 2) {
      setControls((prev) => ({ ...prev, moveLeft: true, moveRight: false }))
    } else {
      setControls((prev) => ({ ...prev, moveLeft: false, moveRight: true }))
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    setControls({ moveLeft: false, moveRight: false })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchEnd])

  return controls
}
