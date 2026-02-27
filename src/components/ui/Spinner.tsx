import React from 'react'

const Spinner: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({ className, size = 'md' }) => {
  const ring = size === 'sm'
    ? 'w-5 h-5 border-2'
    : 'w-8 h-8 border-4'
  return (
    <div className={`flex items-center justify-center ${className ?? 'w-full py-24'}`}>
      <div className={`${ring} border-surface-200 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  )
}

export default Spinner
