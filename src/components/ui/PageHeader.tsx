import React from 'react'

interface PageHeaderAction {
  label: string
  icon?: string
  onClick: () => void
  hidden?: boolean
}

interface PageHeaderProps {
  title: string
  action?: PageHeaderAction
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, action }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-xl font-bold">{title}</h1>
    {action && !action.hidden && (
      <button className="btn-primary" onClick={action.onClick}>
        {action.icon && <span className="material-symbols-outlined text-[16px]">{action.icon}</span>}
        {action.label}
      </button>
    )}
  </div>
)

export default PageHeader
