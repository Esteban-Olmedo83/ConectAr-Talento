import * as React from 'react'

export function useDraggable() {
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const dragging = React.useRef(false)
  const origin = React.useRef({ mx: 0, my: 0, px: 0, py: 0 })

  function onMouseDown(e: React.MouseEvent) {
    // Only drag on left click on the header itself (not buttons inside)
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      setPos({
        x: origin.current.px + e.clientX - origin.current.mx,
        y: origin.current.py + e.clientY - origin.current.my,
      })
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const style: React.CSSProperties = {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    cursor: 'default',
  }

  const headerStyle: React.CSSProperties = {
    cursor: 'move',
    userSelect: 'none',
  }

  return { style, headerStyle, onMouseDown, resetPos: () => setPos({ x: 0, y: 0 }) }
}
