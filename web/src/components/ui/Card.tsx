import React, { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`
        bg-gradient-to-b
        from-black/90
        to-black/75
        border
        border-white/10
        rounded-2xl
        shadow-2xl
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(function CardHeader({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`
        p-6
        border-b
        border-white/10
        bg-white/5
        rounded-t-2xl
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardContent = forwardRef<HTMLDivElement, CardProps>(function CardContent({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`
        p-6
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(function CardFooter({ className = '', children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`
        p-6
        border-t
        border-white/10
        bg-black/40
        rounded-b-2xl
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
}) 