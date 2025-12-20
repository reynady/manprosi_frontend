import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'

export const Route = createFileRoute(
  '/client/land/$landId/plant/$plantId/update',
)({
  component: RouteComponent,
})

// --- API Helpers ---

async function getPlantById(id: string) {
  const res = await fetch(`${API_URL}/plants/${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch plant");
  }

  return data.data;
}

async function getSeeds() {
  const res = await fetch(`${API_URL}/seeds`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed");
  return data.data;
}

async function updatePlantRequest(payload: { id: string; name: string; quantity: number; seed_id: number; planted_at: string; }) {
  const res = await fetch(`${API_URL}/plants/${payload.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ 
        name: payload.name, 
        quantity: payload.quantity, 
        seed_id: payload.seed_id,
        planted_at: payload.planted_at 
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error);
  return data.data;
}

function RouteComponent() {
  const { plantId, landId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [seedId, setSeedId] = useState("");
  const [plantedAt, setPlantedAt] = useState("");
  
  // PERBAIKAN DISINI: Tambahkan isLoading, isError, error
  const { 
    data: plant, 
    isLoading, 
    isError, 
    error 
  } = useQuery({ 
    queryKey: ["plant", plantId], 
    queryFn: () => getPlantById(plantId) 
  });

  const { data: seeds } = useQuery({ queryKey: ["seeds"], queryFn: getSeeds });

  useEffect(() => {
    if (plant) {
      setName(plant.name);
      setQuantity(plant.quantity);
      setSeedId(plant.seed_id);
      if (plant.planted_at) setPlantedAt(plant.planted_at.slice(0, 16));
    }
  }, [plant]);

  const mutation = useMutation({
    mutationFn: updatePlantRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["land-plants", data.land_id] });
      queryClient.invalidateQueries({ queryKey: ["plant", plantId] });
      navigate({ to: `/client/land/${data.land_id}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !plantedAt || !seedId) return;

    const formattedDate = plantedAt.length === 16 ? `${plantedAt}:00` : plantedAt;

    mutation.mutate({
      id: plantId,
      name,
      quantity: Number(quantity),
      seed_id: Number(seedId),
      planted_at: formattedDate,
    });
  };

  if (isLoading) return <p className="p-5">Loading plant...</p>;
  if (isError) return <p className="p-5 text-red-500">{(error as Error).message}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Plant{plant ? `: ${plant.name}` : ''}</h2>
            <p className="text-sm text-gray-600">Update plant data</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" form="edit-plant-form" disabled={mutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-md">{mutation.isPending ? 'Updating...' : 'Update'}</button>
            <BackButton to={`/client/land/${landId}/plant/${plantId}`} />
          </div>
        </div>

        <Card>
          <form id="edit-plant-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Plant Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Seed Source</label>
              <select value={seedId} onChange={(e) => setSeedId(e.target.value)} className="border border-gray-300 rounded p-2 bg-white">
                <option value="">Select a seed</option>
                {seeds?.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Planted At</label>
              <input type="datetime-local" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black bg-white" />
            </div>

            {mutation.isError && <p className="text-red-500 text-sm">{(mutation.error as Error).message}</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}