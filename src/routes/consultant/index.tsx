import { API_URL } from '@/constants';
import fetchJson from '@/lib/safeFetch'
import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { LogOut, Eye, Pencil, Trash } from 'lucide-react';

export const Route = createFileRoute('/consultant/')({
  component: RouteComponent,
})

// --- API Helpers ---

async function getSeeds() {
    const json = await fetchJson(`${API_URL}/seeds`)
    return json?.data ?? []
}

async function deleteSeed(id: number) {
        await fetchJson(`${API_URL}/seeds/${id}`, { method: 'DELETE' })
        return true
}

// Get Recommendations
async function getRecommendations() {
        const json = await fetchJson(`${API_URL}/recommendations`)
        return json?.data ?? []
}

// Delete Recommendation
async function deleteRecommendation(id: number) {
        await fetchJson(`${API_URL}/recommendations/${id}`, { method: 'DELETE' })
        return true
}

async function logoutUser() {
        const json = await fetchJson(`${API_URL}/logout`, { method: 'POST' })
        return json ?? true
}

function RouteComponent() {
    const [activeTab, setActiveTab] = useState('recommendation');
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

    // --- Queries ---

    const {
        data: seeds,
        isLoading: isLoadingSeeds,
        isError: isErrorSeeds,
        error: errorSeeds,
    } = useQuery({
        queryKey: ["seeds"],
        queryFn: getSeeds,
    });

    const {
        data: recs,
        isLoading: isLoadingRecs,
        isError: isErrorRecs,
        error: errorRecs,
    } = useQuery({
        queryKey: ["recommendations"],
        queryFn: getRecommendations,
    });

    // --- Mutations ---

    const deleteSeedMutation = useMutation({
        mutationFn: deleteSeed,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["seeds"] });
        },
        onError: (err: Error) => {
          alert(err.message);
        },
    });

    const deleteRecMutation = useMutation({
        mutationFn: deleteRecommendation,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["recommendations"] });
        },
        onError: (err: Error) => {
          alert(err.message);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: async () => {
            await useAuthStore.getState().clearUser();
            queryClient.removeQueries(); 
            navigate({ to: "/login" });
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    const tabs = [
        { id: 'recommendation', label: 'recommendation' },
        { id: 'seed', label: 'seed' },
        { id: 'profile', label: 'profile' },
    ];

    // Helper to get seed name by ID
    const getSeedName = (id: number) => {
        if (!seeds) return "Loading...";
        const found = seeds.find((s: any) => s.id === id);
        return found ? found.name : `Unknown (ID: ${id})`;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'recommendation':
                if (isLoadingRecs) {
                    return (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading recommendations...</span>
                        </div>
                    );
                }
                if (isErrorRecs) {
                    return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700">{(errorRecs as Error).message}</p>
                        </div>
                    );
                }
                if (recs && recs.length === 0) {
                    return (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No recommendations available.</p>
                        </div>
                    );
                }

                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Target Seed</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recs.map((rec: any) => (
                                        <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{rec.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {rec.rec_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{getSeedName(rec.seed_id)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => navigate({ to: `/consultant/recommendation/${rec.id}` })} 
                                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Detail"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate({ to: `/consultant/recommendation/${rec.id}/update` })} 
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                                                        onClick={() => { 
                                                            if (confirm(`Delete recommendation ${rec.name}?`)) {
                                                                deleteRecMutation.mutate(rec.id); 
                                                            }
                                                        }} 
                                                        title="Delete"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'seed':
                if (isLoadingSeeds) {
                    return (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading seeds...</span>
                        </div>
                    );
                }
                if (isErrorSeeds) {
                    return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700">{(errorSeeds as Error).message}</p>
                        </div>
                    );
                }
                if (seeds && seeds.length === 0) {
                    return (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No seeds available.</p>
                        </div>
                    );
                }

                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Seed Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {seeds.map((seed: any) => (
                                        <tr key={seed.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seed.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{seed.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => navigate({ to: `/consultant/seed/${seed.id}` })} 
                                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Detail"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate({ to: `/consultant/seed/${seed.id}/update` })} 
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                                                        onClick={() => { if (confirm(`Delete seed ${seed.name}?`)) deleteSeedMutation.mutate(seed.id); }} 
                                                        title="Delete"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            
            case 'profile':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.username}</h2>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium capitalize">
                                    {user?.role}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-medium w-full sm:w-auto"
                                >
                                    <LogOut size={18} />
                                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                                </button>
                                {logoutMutation.isError && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {(logoutMutation.error as Error).message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultant Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Manage seeds and recommendations</p>
              </div>
              {/* Logic Tombol Create Berdasarkan Tab Aktif */}
              {activeTab === 'seed' && (
                <button
                  onClick={() => navigate({ to: '/consultant/seed/create' })}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-sm"
                >
                  + Create Seed
                </button>
              )}
              {activeTab === 'recommendation' && (
                <button
                  onClick={() => navigate({ to: '/consultant/recommendation/create' })}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-sm"
                >
                  + Create Recommendation
                </button>
              )}
            </div>
            
            {/* Tabs */}
            <nav aria-label="Tabs" className="flex space-x-1 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  {tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      </div>
    )
}