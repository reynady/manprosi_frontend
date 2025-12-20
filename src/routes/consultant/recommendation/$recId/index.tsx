import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import BackButton from '@/components/BackButton'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/consultant/recommendation/$recId/')({
  component: RouteComponent,
})

async function getRecById(id: string) {
  const json = await fetchJson(`${API_URL}/recommendations/${id}`)
  return json?.data ?? null
}

// Fetch Seed buat lookup nama
async function getSeedById(id: number) {
  const json = await fetchJson(`${API_URL}/seeds/${id}`)
  return json?.data ?? null
}

async function deleteRec(id: number) {
  const res = await fetch(`${API_URL}/recommendations/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt.slice(0,200) || `HTTP ${res.status}`)
  }
  return true
}
  
function RouteComponent() {
    const { recId } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
  
    const { data: rec, isLoading } = useQuery({ queryKey: ["rec", recId], queryFn: () => getRecById(recId) });
    
    // Fetch Seed Name jika Rec sudah ada
    const { data: seed } = useQuery({ 
        queryKey: ["seed", rec?.seed_id], 
        queryFn: () => getSeedById(rec.seed_id),
        enabled: !!rec 
    });
  
    const deleteMutation = useMutation({
      mutationFn: deleteRec,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["recommendations"] });
        navigate({ to: `/consultant` });
      },
    });
  
    if (isLoading) return <p className="p-5">Loading...</p>;
  
    return (
      <div>
        <div className="flex justify-between px-5 border-b border-gray-300">
          <h1 className='py-3'>View Recommendation: {rec?.name}</h1>
          <div className='space-x-2'>
            <BackButton to="/consultant" className="w-[80px] mt-1 h-[40px]" />
            <button onClick={() => navigate({ to: `/consultant/recommendation/${recId}/update` })} className="w-[80px] mt-1 h-[40px] border border-gray-300 rounded hover:bg-gray-100">Update</button>
            <button onClick={() => { if (confirm(`Delete?`)) deleteMutation.mutate(Number(rec.id)); }} className="w-[80px] mt-1 h-[40px] border border-red-200 text-red-600 rounded hover:bg-red-50">Delete</button>
          </div>
        </div>

        {rec && (
          <div className="p-5">
            <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Details</h3>
                <div className="space-y-3">
                    <p><strong className="font-semibold text-black">Type:</strong> {rec.type}</p>
                    <p><strong className="font-semibold text-black">Target Seed:</strong> {seed ? seed.name : 'Loading...'}</p>
                    <p><strong className="font-semibold text-black">Description:</strong></p>
                    <p className="text-gray-700 whitespace-pre-wrap">{rec.description}</p>
                </div>
            </div>
          </div>
        )}
      </div>
    );
  }