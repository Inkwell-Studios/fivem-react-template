import React, { forwardRef } from 'react'

const variants = {
  primary: 'bg-blue-500/90 hover:bg-blue-600/90 active:bg-blue-700/90 text-white',
  secondary: 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20',
  danger: 'bg-red-500/90 hover:bg-red-600/90 active:bg-red-700/90 text-white'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  className?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          rounded-lg
          font-medium
          transition-all
          duration-200
          shadow-lg
          hover:shadow-xl
          active:scale-95
          disabled:opacity-50
          disabled:pointer-events-none
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </button>
    )
  }
) 