import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_URL } from '@/constants'
import BackButton from '@/components/BackButton'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/consultant/seed/create')({
  component: RouteComponent,
})

async function createSeedRequest(payload: { name: string }) {
  const json = await fetchJson(`${API_URL}/seeds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json?.data ?? json
}

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createSeedRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seeds"] });
      navigate({ to: `/consultant` });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name required"); return; }
    mutation.mutate({ name });
  };

  return (
    <div>
      <div className="flex justify-between px-5 border-b border-gray-300">
          <h1 className='py-3'>Add New Seed</h1>
          <div className='space-x-2'>
            <button
                type="submit" form="create-seed-form" 
                disabled={mutation.isPending}
                className="w-[80px] mt-1 h-[40px] border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
                {mutation.isPending ? "Adding..." : "Save"}
            </button>
            <BackButton to="/consultant" className="w-[80px] mt-1 h-[40px]" />
          </div>
        </div>
      <div className="p-5">
        <form id="create-seed-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Seed Name</label>
                <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black"
                    placeholder='e.g. Corn Seeds'
                />
            </div>
        </form>
      </div>
    </div>
  );
}