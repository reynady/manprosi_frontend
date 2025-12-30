import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_URL } from '@/constants'
import fetchJson from '@/lib/safeFetch'
import { Info, Filter } from 'lucide-react'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'

export const Route = createFileRoute('/client/land/$landId/automation/create')({
  component: RouteComponent,
})

// --- Helper Functions (use safe fetchJson)
async function getLandSensors(landId: string) { const json = await fetchJson(`${API_URL}/lands/${landId}/sensors`); return json?.data ?? [] }
async function getLandPumps(landId: string) { const json = await fetchJson(`${API_URL}/lands/${landId}/pumps`); return json?.data ?? [] }
async function getLandValves(landId: string) { const json = await fetchJson(`${API_URL}/lands/${landId}/valves`); return json?.data ?? [] }
async function getRecommendations() { const json = await fetchJson(`${API_URL}/recommendations`); return json?.data ?? [] }
async function getSeeds() { const json = await fetchJson(`${API_URL}/seeds`); return json?.data ?? [] }

async function createAutomationRequest(payload: any) {
  const json = await fetchJson(`${API_URL}/automations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  })
  return json?.data ?? json
}

function RouteComponent() {
  const { landId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State Form
  const [name, setName] = useState("");
  const [type, setType] = useState("Watering");
  const [sensorId, setSensorId] = useState("");
  const [sensorValue, setSensorValue] = useState("");
  const [pumpId, setPumpId] = useState("");
  const [valveId, setValveId] = useState("");
  const [dispenseAmount, setDispenseAmount] = useState("");
  const [error, setError] = useState("");

  // State Filter Rekomendasi (Kanan)
  const [selectedSeedFilter, setSelectedSeedFilter] = useState("");

  // Queries
  const { data: sensors } = useQuery({ queryKey: ["land-sensors", landId], queryFn: () => getLandSensors(landId) });
  const { data: pumps } = useQuery({ queryKey: ["land-pumps", landId], queryFn: () => getLandPumps(landId) });
  const { data: valves } = useQuery({ queryKey: ["land-valves", landId], queryFn: () => getLandValves(landId) });

  const { data: recommendations } = useQuery({ queryKey: ["recommendations"], queryFn: getRecommendations });
  const { data: seeds } = useQuery({ queryKey: ["seeds"], queryFn: getSeeds });

  // Filter Logic
  const filteredRecommendations = recommendations?.filter((rec: any) => {
    const matchType = rec.rec_type === type;
    const matchSeed = selectedSeedFilter ? rec.seed_id === Number(selectedSeedFilter) : true;
    return matchType && matchSeed;
  }) || [];

  const getSeedName = (id: number) => seeds?.find((s: any) => s.id === id)?.name || `Seed #${id}`;

  const mutation = useMutation({
    mutationFn: createAutomationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["land-automations", landId] });
      navigate({ to: `/client/land/${landId}` });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sensorId || !sensorValue || !pumpId || !valveId || !dispenseAmount) {
      setError("All fields are mandatory!");
      return;
    }

    mutation.mutate({
      name,
      automation_type: type,
      land_id: Number(landId),
      sensor_id: Number(sensorId),
      sensor_value: Number(sensorValue),
      pump_id: Number(pumpId),
      valve_id: Number(valveId),
      dispense_amount: Number(dispenseAmount),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <main className="px-4 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Automation</h2>
            </div>
            <Card>
              <form id="create-auto-form" onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Automation Name</label>
                  <input className="w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} placeholder="Automation name" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border px-3 py-2 rounded bg-white">
                    <option value="Watering">Watering</option>
                    <option value="Fertilization">Fertilization</option>
                    <option value="PestControl">Pest Control</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Trigger Sensor</label>
                    <select value={sensorId} onChange={(e) => setSensorId(e.target.value)} className="w-full border px-3 py-2 rounded bg-white">
                      <option value="">Select Sensor</option>
                      {sensors?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.sensor_type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Threshold Value</label>
                    <input type="number" step="0.1" value={sensorValue} onChange={(e) => setSensorValue(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="0.0" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Action Pump *</label>
                  <select value={pumpId} onChange={(e) => setPumpId(e.target.value)} className="w-full border px-3 py-2 rounded bg-white" required>
                    <option value="">Select Pump</option>
                    {pumps?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Action Valve *</label>
                  <select value={valveId} onChange={(e) => setValveId(e.target.value)} className="w-full border px-3 py-2 rounded bg-white" required>
                    <option value="">Select Valve</option>
                    {valves?.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Dispense Amount (Liters) *</label>
                  <input type="number" step="0.1" value={dispenseAmount} onChange={(e) => setDispenseAmount(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="e.g. 5.0" required />
                </div>

                <div className="flex justify-end">
                  <BackButton to={`/client/land/${landId}`} className="mr-2" />
                  <button type="submit" className="px-3 py-1 bg-black text-white rounded">{mutation.isPending ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </Card>
          </section>

          <aside>
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-sm">Expert Recommendations</h3>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3">Based on best practices for <strong>{type}</strong>.</p>

              <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 mb-3">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={selectedSeedFilter}
                  onChange={(e) => setSelectedSeedFilter(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
                >
                  <option value="">All Plants</option>
                  {seeds?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredRecommendations.length > 0 ? (
                  filteredRecommendations.map((rec: any) => (
                    <div key={rec.id} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{rec.name}</h4>
                        <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{getSeedName(rec.seed_id)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{rec.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No recommendations found.</div>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}