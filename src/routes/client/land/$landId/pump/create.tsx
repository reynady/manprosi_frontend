import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_URL } from '@/constants'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/client/land/$landId/pump/create')({
  component: RouteComponent,
})

async function createPumpRequest(payload: { name: string; land_id: number }) {
  const json = await fetchJson(`${API_URL}/pumps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json?.data ?? null
}

function RouteComponent() {
  const { landId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createPumpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["land-pumps", landId] });
      navigate({ to: `/client/land/${landId}` });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name required"); return; }
    mutation.mutate({ name, land_id: Number(landId) });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Pump</h2>
            <p className="text-sm text-gray-600">Register a pump for this land</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" form="create-pump-form" disabled={mutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Save</button>
            <BackButton to={`/client/land/${landId}`} />
          </div>
        </div>

        <Card>
          <form id="create-pump-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Pump Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black" placeholder='e.g. Pump 1' />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}