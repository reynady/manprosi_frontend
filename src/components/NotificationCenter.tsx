import { useNotificationStore } from '@/stores/useNotificationStore'

export default function NotificationCenter() {
  const items = useNotificationStore((s) => s.items)
  const remove = useNotificationStore((s) => s.remove)

  if (!items.length) return null

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {items.map((it) => (
        <div
          key={it.id}
          className={`max-w-sm w-full p-3 rounded-lg shadow-lg border transition-all bg-white flex items-start gap-3 ${
            it.type === 'error' ? 'border-red-200' : it.type === 'success' ? 'border-green-200' : 'border-gray-200'
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-sm text-gray-900">{it.title}</div>
              <button onClick={() => remove(it.id)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            {it.message && <div className="text-sm text-gray-600 mt-1">{it.message}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
