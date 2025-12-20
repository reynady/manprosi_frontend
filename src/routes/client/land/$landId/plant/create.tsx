import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_URL } from '@/constants'
import fetchJson from '@/lib/safeFetch'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'

export const Route = createFileRoute('/client/land/$landId/plant/create')({
  component: RouteComponent,
})

// Fetch Seeds untuk dropdown
async function getSeeds() {
  try {
    const json = await fetchJson(`${API_URL}/seeds`)
    return json?.data ?? []
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (msg.includes('status 404') || msg.includes('Cannot GET') || msg.includes('404')) return []
    throw err
  }
}

type CreatePlantPayload = {
  name: string;
  quantity: number;
  land_id: number;
  seed_id: number; // <--- Ditambahkan
  planted_at: string;
}

async function createPlantRequest(payload: CreatePlantPayload) {
  const json = await fetchJson(`${API_URL}/plants`, {
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

  // State
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [seedId, setSeedId] = useState(""); // <--- State Seed
  const [plantedAt, setPlantedAt] = useState("");
  const [error, setError] = useState("");

  // Query Seeds
  const { data: seeds } = useQuery({ queryKey: ["seeds"], queryFn: getSeeds });

  const mutation = useMutation({
    mutationFn: createPlantRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["land-plants", landId] });
      navigate({ to: `/client/land/${landId}` });
    },
    onError: (err: Error) => setError(err.message),
  });

  // Create seed inline
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !plantedAt || !seedId) {
        setError("All fields required"); return;
    }

    const formattedDate = plantedAt.length === 16 ? `${plantedAt}:00` : plantedAt;

    mutation.mutate({
      name,
      quantity: Number(quantity),
      land_id: Number(landId),
      seed_id: Number(seedId), // <--- Kirim Seed ID
      planted_at: formattedDate,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Plant</h2>
            <p className="text-sm text-gray-600">Record new plants for this land</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" form="create-plant-form" disabled={mutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Save</button>
            <BackButton to={`/client/land/${landId}`} />
          </div>
        </div>

        <Card>
          <form id="create-plant-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Plant Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded p-2" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Seed Source</label>
              <div className="flex gap-2 items-center">
                <select value={seedId} onChange={(e) => setSeedId(e.target.value)} className="border border-gray-300 rounded p-2 bg-white flex-1">
                  <option value="">Select a seed</option>
                  {seeds?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                
              </div>

              
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border border-gray-300 rounded p-2" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Planted At</label>
              <input type="datetime-local" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} className="border border-gray-300 rounded p-2 bg-white" />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}