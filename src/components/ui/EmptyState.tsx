interface EmptyStateProps {
  emoji?: string
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ emoji = '👀', title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-pink-200/50 blur-2xl scale-150" />
        <div className="relative w-20 h-20 rounded-[1.75rem] bg-white border border-pink-100 shadow-lg shadow-pink-100/60 flex items-center justify-center text-4xl float-anim">
          {emoji}
        </div>
      </div>
      <h3 className="font-black text-gray-700 text-lg">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1.5 max-w-xs leading-relaxed">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-6 px-6">
          {action.label}
        </button>
      )}
    </div>
  )
}
