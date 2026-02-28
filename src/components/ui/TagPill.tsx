import React from 'react'
// TagPill — pill para mostrar etiquetas/variantes seleccionadas, con o sin botón de quitar.
// variant='default' → fondo surface-100 (listas de detalle)
// variant='primary' → fondo primary-50 con borde (campos de formulario)

interface TagPillProps {
  label: string
  sublabel?: string
  onRemove?: () => void
  removeDisabled?: boolean
  variant?: 'default' | 'primary'
}

const VARIANT_CLASSES = {
  default: 'bg-surface-100 text-surface-800',
  primary: 'bg-primary-50 border border-primary-200 text-primary-700',
}

const TagPill: React.FC<TagPillProps> = ({
  label,
  sublabel,
  onRemove,
  removeDisabled = false,
  variant = 'default',
}) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${VARIANT_CLASSES[variant]}`}>
    {label}
    {sublabel && <span className="text-surface-400 ml-0.5">({sublabel})</span>}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        disabled={removeDisabled}
        className="ml-0.5 leading-none hover:text-red-600 disabled:opacity-50"
      >
        ×
      </button>
    )}
  </span>
)

export default TagPill
