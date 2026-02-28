'use client'
// ActionButtons — grupo de botones de acción para filas de tabla (editar, imprimir, eliminar).
// Cada botón es opcional — solo se renderiza si se pasa el callback correspondiente.
// Usa la clase `btn-icon` definida en globals.css (botón cuadrado pequeño con hover).
// Iconos: Material Symbols Outlined a 16px.
import React from 'react'

interface ActionButtonsProps {
  onEdit?: () => void
  onPrint?: () => void
  onDelete?: () => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onPrint, onDelete }) => (
  <div className="flex gap-1">
    {onEdit && (
      <button className="btn-icon" onClick={onEdit}>
        <span className="material-symbols-outlined text-[16px]">edit</span>
      </button>
    )}
    {onPrint && (
      <button className="btn-icon" onClick={onPrint}>
        <span className="material-symbols-outlined text-[16px]">print</span>
      </button>
    )}
    {onDelete && (
      <button className="btn-icon" onClick={onDelete}>
        <span className="material-symbols-outlined text-[16px]">delete</span>
      </button>
    )}
  </div>
)

export default ActionButtons
