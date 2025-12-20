import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_URL } from '@/constants'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/client/land/$landId/sensor/create')({
  component: RouteComponent,
})

type CreateSensorPayload = {
  name: string;
  sensor_type: string;
  land_id: number;
}

async function createSensorRequest(payload: CreateSensorPayload) {
  const json = await fetchJson(`${API_URL}/sensors`, {
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
  const [sensorType, setSensorType] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    sensorType?: string;
    server?: string;
  }>({});

  const mutation = useMutation({
    mutationFn: createSensorRequest,
    onSuccess: () => {
      // Refresh data sensor di halaman detail land
      queryClient.invalidateQueries({ queryKey: ["land-sensors", landId] });
      // Kembali ke halaman detail land
      navigate({ to: `/client/land/${landId}` });
    },
    onError: (err: Error) => {
      const msg = String(err?.message || '')
      if (msg.includes('Cannot POST') || msg.includes('status 404') || msg.includes('Cannot GET')) {
        setErrors({ server: 'Server route not found (POST /sensors). Ensure backend route exists.' });
      } else {
        setErrors({ server: msg });
      }
    },
  });

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSensorType(e.target.value);
  }; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Sensor name is required";
    if (!sensorType) newErrors.sensorType = "Sensor type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      name,
      sensor_type: sensorType,
      land_id: Number(landId),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Sensor</h2>
            <p className="text-sm text-gray-600">Register a sensor to this land</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="create-sensor-form"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Adding...' : 'Save'}
            </button>
            <BackButton to={`/client/land/${landId}`} />
          </div>
        </div>

        <Card>
          <form id="create-sensor-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {errors.server && <p className="text-red-500 text-sm">{errors.server}</p>}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Sensor Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Soil Moisture 1" className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Sensor Type</label>
              <select value={sensorType} onChange={handleTypeChange} className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black bg-white">
                <option value="">Select Type</option>
                <option value="Temperature">Temperature</option>
                <option value="Humidity">Humidity (Air)</option>
                <option value="SoilMoisture">Soil Moisture</option>
                <option value="PH">pH Level</option>
                <option value="LightIntensity">Light Intensity</option>
              </select>
              {errors.sensorType && <p className="text-red-500 text-xs">{errors.sensorType}</p>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}