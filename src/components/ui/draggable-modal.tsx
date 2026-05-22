'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { useDraggable } from '@/hooks/useDraggable'

/**
 * Drop-in replacement for shadcn Dialog that adds drag-to-move behavior.
 * Usage:
 *   <DraggableModal open={open} onClose={onClose} title="My Title" maxWidth="32rem">
 *     {form content}
 *   </DraggableModal>
 */
export function DraggableModal({
  open,
  onClose,
  title,
  children,
  maxWidth = '32rem',
  footer,
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  maxWidth?: string
  footer?: React.ReactNode
}) {
  const { style: dragStyle, headerStyle, onMouseDown, resetPos } = useDraggable()

  React.useEffect(() => {
    if (!open) resetPos()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ ...dragStyle, width: '90vw', maxWidth, maxHeight: '90vh', background: 'var(--surface)', borderColor: 'var(--border)' }}
        className="flex flex-col rounded-xl border shadow-2xl overflow-hidden"
      >
        {/* draggable header */}
        <div
          style={{ ...headerStyle, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          onMouseDown={onMouseDown}
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
        >
          <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-[var(--accent-soft)]"
            style={{ color: 'var(--muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* scrollable content */}
        <div
          className="flex-1 overflow-y-auto p-5"
          style={{ background: 'var(--surface)' }}
        >
          {children}
        </div>

        {/* optional sticky footer */}
        {footer && (
          <div
            className="shrink-0 px-5 py-3 border-t"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
