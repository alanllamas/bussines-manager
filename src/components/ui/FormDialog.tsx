'use client'
// FormDialog — wrapper de Headless UI Dialog para formularios en modal.
// z-50 garantiza que quede sobre todo el contenido de página.
// Sin backdrop/overlay — el dialog flota sobre el contenido sin oscurecer el fondo.
// panelClassName: clase del panel interior (controla tamaño y estilo del cuadro del form).
// dialogClassName: clase adicional del Dialog exterior (raro usarlo, disponible por flexibilidad).
// onClose: se pasa a Dialog — se dispara con Escape o click fuera del panel.
import React from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'

interface FormDialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  panelClassName?: string
  dialogClassName?: string
}

const FormDialog: React.FC<FormDialogProps> = ({ isOpen, onClose, children, panelClassName, dialogClassName }) => (
  <Dialog open={isOpen} onClose={onClose} className={`relative z-50 ${dialogClassName ?? ''}`}>
    <div className="fixed inset-0 flex w-screen items-center justify-center">
      <DialogPanel className={panelClassName}>
        {children}
      </DialogPanel>
    </div>
  </Dialog>
)

export default FormDialog
