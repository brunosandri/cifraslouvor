'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal
        aria-labelledby="dialog-title"
        className={cn(
          'relative z-10 w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-800">
          <div>
            <h2 id="dialog-title" className="text-base font-semibold text-gray-100">{title}</h2>
            {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mr-1 -mt-1">
            <X size={16} />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
