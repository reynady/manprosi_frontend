import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import { useAuthStore } from '@/stores/useAuthStore'
import BackButton from '@/components/BackButton'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/client/land/$landId/update')({
  component: RouteComponent,
})

async function getLandById(id: string) {
    try {
      const json = await fetchJson(`${API_URL}/lands/${id}`)
      return json?.data ?? null
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (msg.includes('status 404') || msg.includes('Cannot GET') || msg.includes('404')) return null
      throw err
    }
}
  
  async function updateLand({ id, location_name, size }: { id: string; location_name: string; size: number; }) {
    const json = await fetchJson(`${API_URL}/lands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_name, size }),
    })
    return json?.data ?? null
  }
  
  function RouteComponent() {
    const { landId } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
  
    const {
      data: land,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["land", landId],
      queryFn: () => getLandById(landId),
    });
  
    const updateMutation = useMutation({
      mutationFn: updateLand,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["lands", user?.id] });
        await queryClient.invalidateQueries({ queryKey: ["land", landId] });
        
        navigate({ to: "/client" });
      },
    });
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const location_name = formData.get("location_name") as string;
      const size = Number(formData.get("size"));
  
      if (!location_name || size <= 0) {
        alert("Please fill valid data");
        return;
      }
  
      updateMutation.mutate({ id: landId, location_name, size });
    };
  
    if (isLoading) return <p className="p-5">Loading land data...</p>;
    if (isError) return <p className="p-5 text-red-500">{(error as Error).message}</p>;
    if (!land) return (
      <div className="p-5">
        <p className="text-gray-700">Land not found or server returned non-JSON. Please go back.</p>
        <div className="mt-4">
          <button onClick={() => navigate({ to: '/client' })} className="px-4 py-2 bg-green-600 text-white rounded">Back</button>
        </div>
      </div>
    );
  
    return (
      <div>
        <div className="flex justify-between px-5 border-b border-gray-300">
          <h1 className='py-3'>Edit Land: {land && land.location_name}</h1>
          <div className='space-x-2'>
            <button
                type="submit"
                form="edit-land-form" 
                disabled={updateMutation.isPending}
                className="w-[80px] mt-1 h-[40px] border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {updateMutation.isPending ? "Updating..." : "Update"}
            </button>
            
            <BackButton to={`/client/land/${landId}`} className="w-[80px] mt-1 h-[40px]" />
          </div>
        </div>

        <div className="p-5">
            <form id="edit-land-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Location Name</label>
                    <input
                      name="location_name"
                      defaultValue={land?.location_name}
                        required
                        type="text"
                        placeholder="e.g. Kebun Utara"
                        className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black"
                    />
                </div>
        
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Size (Hectares)</label>
                    <input
                      name="size"
                      defaultValue={land?.size as any}
                        required
                        type="number"
                        step="0.01"
                        placeholder="e.g. 2.5"
                        className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black"
                    />
                </div>
        
                {updateMutation.isError && (
                <p className="text-red-500 text-sm">
                    {(updateMutation.error as Error).message}
                </p>
                )}
            </form>
        </div>
      </div>
    );
  }