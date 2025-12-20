import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  to?: string
  onClick?: () => void
  className?: string
}

export default function BackButton({ to, onClick, className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      try {
        navigate({ to })
      } catch (error) {
        console.error('Navigation error:', error)
        window.history.back()
      }
    } else {
      window.history.back()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 shadow-sm ${className}`}
    >
      <ArrowLeft size={18} className="text-gray-600" />
      <span>Back</span>
    </button>
  )
}

