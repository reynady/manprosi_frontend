import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'

export const Route = createFileRoute(
  '/client/land/$landId/sensor/$sensorId/update',
)({
  component: RouteComponent,
})

async function getSensorById(id: string) {
  const res = await fetch(`${API_URL}/sensors/${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch sensor");
  }

  return data.data;
}

async function updateSensorRequest(payload: {
  id: string;
  name: string;
  sensor_type: string;
}) {
  const res = await fetch(`${API_URL}/sensors/${payload.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: payload.name,
      sensor_type: payload.sensor_type,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update sensor");
  }

  return data.data;
}

function RouteComponent() {
  const { sensorId, landId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [sensorType, setSensorType] = useState("");
  
  const { data: sensor, isLoading, isError, error } = useQuery({
    queryKey: ["sensor", sensorId],
    queryFn: () => getSensorById(sensorId),
  });

  useEffect(() => {
    if (sensor) {
      setName(sensor.name);
      setSensorType(sensor.sensor_type);
    }
  }, [sensor]);

  const mutation = useMutation({
    mutationFn: updateSensorRequest,
    onSuccess: (data) => {
      // Invalidate query untuk sensor spesifik dan list sensor di land tersebut
      queryClient.invalidateQueries({ queryKey: ["land-sensors", data.land_id] });
      queryClient.invalidateQueries({ queryKey: ["sensor", sensorId] });
      
      // Navigate kembali ke detail land
      navigate({ to: `/client/land/${data.land_id}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sensorType) return;

    mutation.mutate({
      id: sensorId,
      name,
      sensor_type: sensorType,
    });
  };

  if (isLoading) return <p className="p-5">Loading sensor...</p>;
  if (isError) return <p className="p-5 text-red-500">{(error as Error).message}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Sensor{sensor ? `: ${sensor.name}` : ''}</h2>
            <p className="text-sm text-gray-600">Update sensor configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" form="edit-sensor-form" disabled={mutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-md">{mutation.isPending ? 'Updating...' : 'Update'}</button>
            <BackButton to={`/client/land/${landId}/sensor/${sensorId}`} />
          </div>
        </div>

        <Card>
          <form id="edit-sensor-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Sensor Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Sensor Type</label>
              <select value={sensorType} onChange={(e) => setSensorType(e.target.value)} className="border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-black">
                <option value="Temperature">Temperature</option>
                <option value="Humidity">Humidity</option>
                <option value="SoilMoisture">Soil Moisture</option>
                <option value="PH">pH</option>
                <option value="LightIntensity">Light Intensity</option>
              </select>
            </div>

            {mutation.isError && <p className="text-red-500 text-sm">{(mutation.error as Error).message}</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}