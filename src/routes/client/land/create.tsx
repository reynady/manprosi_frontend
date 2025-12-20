import { API_URL } from '@/constants';
import fetchJson from '@/lib/safeFetch'
import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'

export const Route = createFileRoute('/client/land/create')({
  component: RouteComponent,
})

async function createLandRequest(payload: {
  location_name: string;
  size: number;
  user_id: number;
}) {
  const json = await fetchJson(`${API_URL}/lands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return json?.data ?? json
}

function RouteComponent() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  
  const [locationName, setLocationName] = useState("");
  const [size, setSize] = useState("");
  const [errors, setErrors] = useState<{
      locationName?: string;
      size?: string;
      server?: string;
  }>({});

  const mutation = useMutation({
      mutationFn: createLandRequest,
      onSuccess: () => {
          navigate({ to: "/client" });
      },
      onError: (err: Error) => {
          setErrors({ server: err.message });
      },
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: typeof errors = {};
      
      if (!locationName.trim()) newErrors.locationName = "Location name is required";
      if (!size || Number(size) <= 0) newErrors.size = "Size must be greater than 0";
      if (!user?.id) newErrors.server = "User session not found. Please relogin.";

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
      }

      mutation.mutate({
          location_name: locationName,
          size: Number(size),
          user_id: user!.id,
      });
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <NotificationCenter />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Land</h2>
              <p className="text-sm text-gray-600">Add a new land for monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                form="create-land-form"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </button>
              <BackButton to="/client" />
            </div>
          </div>

          <Card>
            <form id="create-land-form" onSubmit={handleSubmit} className="space-y-4">
              {errors.server && <p className="text-red-500 text-sm">{errors.server}</p>}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Kebun 1"
                  className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black"
                />
                {errors.locationName && <p className="text-red-500 text-xs">{errors.locationName}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Size (Ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 12.5"
                  className="border border-gray-300 rounded p-2 focus:outline-none focus:border-black"
                />
                {errors.size && <p className="text-red-500 text-xs">{errors.size}</p>}
              </div>
            </form>
          </Card>
        </div>
      </div>
  );
}