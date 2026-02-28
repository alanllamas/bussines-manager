import React from 'react'

// Spinner — indicador de carga circular.
// size: 'sm' = w-5/border-2, 'md' (default) = w-8/border-4.
// className sobreescribe el contenedor externo completo (default: w-full py-24 centrado).
// Colores: anillo base surface-200, arco giratorio primary-500.
// No exportado desde ui/index.ts — se importa directamente donde se necesita.
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
