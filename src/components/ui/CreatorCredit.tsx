import { Instagram } from 'lucide-react'
import { CREATOR } from '../../config'

export function CreatorCredit({ className = '' }: { className?: string }) {
  return (
    <a
      href={CREATOR.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-500 transition-colors ${className}`}
    >
      Dibuat dengan 💗 oleh
      <span className="inline-flex items-center gap-1 font-bold text-gray-500 group-hover:text-pink-500">
        <Instagram size={12} className="transition-transform group-hover:scale-110" />@{CREATOR.handle}
      </span>
    </a>
  )
}
