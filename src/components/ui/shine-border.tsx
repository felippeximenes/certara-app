import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ShineBorderProps = {
  children: ReactNode
  className?: string
  borderWidth?: number
  duration?: number
  rounded?: string
}

export function ShineBorder({
  children,
  className,
  borderWidth = 1.5,
  duration = 5,
  rounded = 'rounded-xl',
}: ShineBorderProps) {
  return (
    <div
      className={cn(`relative ${rounded}`, className)}
      style={{ padding: borderWidth }}
    >
      {/* Rotating conic gradient — cores primárias do projeto */}
      <div className={`absolute inset-0 ${rounded} overflow-hidden`}>
        <div
          className="absolute -inset-full blur-[3px]"
          style={{
            background: 'conic-gradient(from 0deg, #3B39E8, #8B5CF6, #6366F1, #4F46E5, #3B39E8)',
            animation: `spin ${duration}s linear infinite`,
          }}
        />
      </div>
      <div className={`relative ${rounded} bg-card h-full`}>
        {children}
      </div>
    </div>
  )
}
