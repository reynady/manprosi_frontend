import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'

export const Route = createFileRoute('/client/land/$landId/valve/$valveId/')({
  component: RouteComponent,
})

async function getValveById(id: string) {
    const res = await fetch(`${API_URL}/valves/${id}`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error);
    return data.data;
}

async function deleteValve(id: number) {
    const res = await fetch(`${API_URL}/valves/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error);
    return data;
}
  
function RouteComponent() {
    const { landId, valveId } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
  
    const { data: valve, isLoading, isError, error } = useQuery({
      queryKey: ["valve", valveId],
      queryFn: () => getValveById(valveId),
    });
  
    const deleteMutation = useMutation({
      mutationFn: deleteValve,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["land-valves", landId] });
        navigate({ to: `/client/land/${landId}` });
      },
    });
  
    if (isLoading) return <p className="p-5">Loading...</p>;
    if (isError) return <p className="p-5 text-red-500">{(error as Error).message}</p>;
  
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <NotificationCenter />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">View Valve{valve ? `: ${valve.name}` : ''}</h2>
              <p className="text-sm text-gray-600">Valve details</p>
            </div>
            <div className="flex items-center gap-2">
              <BackButton to={`/client/land/${landId}`} />
              <button onClick={() => navigate({ to: `/client/land/${landId}/valve/${valveId}/update` })} className="px-3 py-2 border border-gray-300 rounded-md">Update</button>
              <button onClick={() => { if (valve && confirm(`Delete ${valve.name}?`)) deleteMutation.mutate(Number(valve.id)); }} disabled={deleteMutation.isPending} className="px-3 py-2 border border-red-200 text-red-600 rounded-md">{deleteMutation.isPending ? '...' : 'Delete'}</button>
            </div>
          </div>

          <Card>
            {valve && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Valve Information</h3>
                <div className="space-y-2">
                  <p><strong className="font-semibold text-black">Name:</strong> {valve.name}</p>
                  <p><strong className="font-semibold text-black">Land ID:</strong> {valve.land_id}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }