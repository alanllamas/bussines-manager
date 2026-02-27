'use client'
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
