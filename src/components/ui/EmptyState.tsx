import React from 'react'
// EmptyState — bloque vacío centrado con icono Material Symbols + mensaje.
// Dos casos de uso:
//   Standalone (mobile cards): <EmptyState icon="inbox" message="Sin notas" />
//   Dentro de tabla (desktop): <tr><td colSpan={n}><EmptyState ... /></td></tr>
interface EmptyStateProps {
  icon: string
  message: string
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, className = '' }) => (
  <div className={`py-12 text-center ${className}`}>
    <span className="material-symbols-outlined text-[40px] text-surface-300 block">{icon}</span>
    <p className="text-sm text-surface-400 mt-2">{message}</p>
  </div>
)

export default EmptyState
