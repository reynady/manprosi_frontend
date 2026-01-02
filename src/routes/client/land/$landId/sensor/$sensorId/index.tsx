import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/client/land/$landId/sensor/$sensorId/')({
  component: RouteComponent,
})

// --- API Helpers ---

// 1. Ambil detail satu sensor berdasarkan ID
async function getSensorById(sensorId: string) {
  const json = await fetchJson(`${API_URL}/sensors/${sensorId}`);
  return json?.data;
}

// 2. Ambil nilai terakhir (History)
async function getLatestSensorValue(sensorId: string) {
  try {
    const json = await fetchJson(`${API_URL}/sensors/${sensorId}/latest`);
    return json?.data;
  } catch (e: any) {
    if (e.message.includes('404')) return null;
    throw e;
  }
}

// 3. Hapus Sensor
async function deleteSensor(id: number) {
  const json = await fetchJson(`${API_URL}/sensors/${id}`, {
    method: "DELETE",
  });
  return json;
}

function RouteComponent() {
  const { landId, sensorId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query Detail Sensor
  const {
    data: sensor,
    isLoading: isLoadingSensor,
    isError: isErrorSensor,
    error: errorSensor
  } = useQuery({
    queryKey: ["sensor", sensorId],
    queryFn: () => getSensorById(sensorId),
  });

  // Query Nilai Terakhir
  const {
    data: latestVal,
    isLoading: isLoadingVal
  } = useQuery({
    queryKey: ["sensor-latest", sensorId],
    queryFn: () => getLatestSensorValue(sensorId),
    enabled: !!sensorId // Hanya jalan jika sensorId ada
  });

  // Mutation Delete
  const deleteMutation = useMutation({
    mutationFn: deleteSensor,
    onSuccess: () => {
      // Refresh list sensor di halaman land
      queryClient.invalidateQueries({ queryKey: ["land-sensors", landId] });
      // Kembali ke halaman detail Land
      navigate({ to: `/client/land/${landId}` });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  if (isLoadingSensor) return <p className="p-5">Loading sensor details...</p>;
  if (isErrorSensor) return <p className="p-5 text-red-500">{(errorSensor as Error).message}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">View Sensor{sensor ? `: ${sensor.name}` : ''}</h2>
            <p className="text-sm text-gray-600">Sensor details and latest readings</p>
          </div>
          <div className="flex items-center gap-2">
            <BackButton to={`/client/land/${landId}`} />
            <button onClick={() => navigate({ to: `/client/land/${landId}/sensor/${sensorId}/update` })} className="px-3 py-2 border border-gray-300 rounded-md">Update</button>
            <button onClick={() => { if (sensor && confirm(`Delete sensor ${sensor.name}?`)) deleteMutation.mutate(Number(sensor.id)); }} disabled={deleteMutation.isPending} className="px-3 py-2 border border-red-200 text-red-600 rounded-md">{deleteMutation.isPending ? '...' : 'Delete'}</button>
          </div>
        </div>

        <Card>
          {sensor && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Sensor Information</h3>
                <div className="space-y-2">
                  <p><strong className="font-semibold text-black">Name:</strong> {sensor.name}</p>
                  <p><strong className="font-semibold text-black">Type:</strong> {sensor.sensor_type}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Latest Reading</h3>
                {isLoadingVal ? (
                  <p className="text-gray-500">Loading latest value...</p>
                ) : latestVal ? (
                  <div>
                    <div className="text-4xl font-bold text-gray-900">{latestVal.value}</div>
                    <p className="text-xs font-bold text-gray-400 mt-2">Recorded at: {latestVal.recorded_at ? new Date(latestVal.recorded_at).toLocaleString() : 'Invalid Date'}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No data recorded yet.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}