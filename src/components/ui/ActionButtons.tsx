'use client'
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
