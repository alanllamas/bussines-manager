import React from 'react'
// StatusBadge — pill coloreado para estados de negocio (compras, cotizaciones, etc.).
// El caller mapea status → color; el componente solo aplica el estilo.
// Colores disponibles: gray, blue, yellow, green, red.

type BadgeColor = 'gray' | 'blue' | 'yellow' | 'green' | 'red'

const COLOR_CLASSES: Record<BadgeColor, string> = {
  gray:   'bg-surface-100 text-surface-600',
  blue:   'bg-blue-50 text-blue-700',
  yellow: 'bg-accent-50 text-accent-700',
  green:  'bg-green-50 text-green-700',
  red:    'bg-red-50 text-red-700',
}

interface StatusBadgeProps {
  label: string
  color: BadgeColor
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLOR_CLASSES[color]} ${className}`}>
    {label}
  </span>
)

export default StatusBadge
