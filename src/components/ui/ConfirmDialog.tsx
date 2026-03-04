'use client'
import React from 'react'
import FormDialog from './FormDialog'
// ConfirmDialog — diálogo de confirmación para acciones destructivas o irreversibles.
// Reutiliza FormDialog (mismo patrón: z-50, sin backdrop, Escape/outside-click cancela).
// danger=true: botón de confirmación usa btn-danger en lugar de btn-primary.
// Uso típico: quitar una variante, eliminar una línea de formulario, borrar un registro.

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}) => (
  <FormDialog
    isOpen={open}
    onClose={onCancel}
    panelClassName="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4"
  >
    <h3 className="font-semibold text-surface-800 text-base mb-2">{title}</h3>
    <p className="text-sm text-surface-600 mb-6">{message}</p>
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="btn-secondary">
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={danger ? 'btn-danger' : 'btn-primary'}
      >
        {confirmLabel}
      </button>
    </div>
  </FormDialog>
)

export default ConfirmDialog
