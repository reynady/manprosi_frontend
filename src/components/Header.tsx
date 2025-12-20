import React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import { useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">PO</div>
            <div>
              <div className="text-lg font-semibold text-gray-900">Palm Oil Monitoring</div>
              <div className="text-sm text-gray-500">Dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-gray-50" title="Notifications">
              <Bell />
            </button>

            {user ? (
              <div className="text-sm text-gray-700 capitalize">{user.role} • {user.username}</div>
            ) : (
              typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') ? (
                <button onClick={() => navigate({ to: '/login' })} className="px-3 py-2 rounded-md bg-green-600 text-white">Sign in</button>
              ) : null
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
