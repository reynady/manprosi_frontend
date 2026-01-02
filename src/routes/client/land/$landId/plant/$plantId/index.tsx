import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/client/land/$landId/plant/$plantId/')({
  component: RouteComponent,
})

// --- API Helpers ---

// 1. Ambil detail satu plant
async function getPlantById(plantId: string) {
  const json = await fetchJson(`${API_URL}/plants/${plantId}`);
  return json?.data;
}

// 2. Ambil detail seed untuk ditampilkan namanya
async function getSeedById(id: number) {
  const json = await fetchJson(`${API_URL}/seeds/${id}`);
  return json?.data;
}

// 3. Hapus Plant
async function deletePlant(id: number) {
  const json = await fetchJson(`${API_URL}/plants/${id}`, {
    method: "DELETE",
  });
  return json;
}

function RouteComponent() {
  const { landId, plantId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query Detail Plant
  const {
    data: plant,
    isLoading: isLoadingPlant,
    isError: isErrorPlant,
    error: errorPlant
  } = useQuery({
    queryKey: ["plant", plantId],
    queryFn: () => getPlantById(plantId),
  });

  // Query Detail Seed (Hanya dijalankan jika plant sudah ter-load dan punya seed_id)
  const { data: seed } = useQuery({
    queryKey: ["seed", plant?.seed_id],
    queryFn: () => getSeedById(plant!.seed_id),
    enabled: !!plant?.seed_id // Penting: Jangan fetch jika plant belum ada
  });

  // Mutation Delete
  const deleteMutation = useMutation({
    mutationFn: deletePlant,
    onSuccess: () => {
      // Refresh list plants di halaman land
      queryClient.invalidateQueries({ queryKey: ["land-plants", landId] });
      // Kembali ke halaman detail Land
      navigate({ to: `/client/land/${landId}` });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  if (isLoadingPlant) return <p className="p-5">Loading plant details...</p>;
  if (isErrorPlant) return <p className="p-5 text-red-500">{(errorPlant as Error).message}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">View Plant{plant ? `: ${plant.name}` : ''}</h2>
            <p className="text-sm text-gray-600">Plant details and planting date</p>
          </div>
          <div className="flex items-center gap-2">
            <BackButton to={`/client/land/${landId}`} />
            <button onClick={() => navigate({ to: `/client/land/${landId}/plant/${plantId}/update` })} className="px-3 py-2 border border-gray-300 rounded-md">Update</button>
            <button onClick={() => { if (plant && confirm(`Delete plant ${plant.name}?`)) deleteMutation.mutate(Number(plant.id)); }} disabled={deleteMutation.isPending} className="px-3 py-2 border border-red-200 text-red-600 rounded-md">{deleteMutation.isPending ? '...' : 'Delete'}</button>
          </div>
        </div>

        <Card>
          {plant && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Plant Information</h3>
                <div className="space-y-2">
                  <p><strong className="font-semibold text-black">Name:</strong> {plant.name}</p>
                  <p><strong className="font-semibold text-black">Quantity:</strong> {plant.quantity}</p>
                  <p><strong className="font-semibold text-black">Seed Source:</strong> {seed ? seed.name : 'Loading...'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Planting Details</h3>
                <div>
                  <div className="text-xl font-bold text-gray-900">{plant.planted_at ? new Date(plant.planted_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
                  <p className="text-xs font-bold text-gray-400 mt-2">Exact time: {plant.planted_at ? new Date(plant.planted_at).toLocaleTimeString() : ''}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}