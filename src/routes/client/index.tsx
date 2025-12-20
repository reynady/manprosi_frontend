import { API_URL } from '@/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { Eye, Pencil, Trash, LogOut, Bell } from 'lucide-react';
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import Card from '@/components/ui/Card'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/client/')({
  component: RouteComponent,
})

// --- API Helpers ---

async function getUserLands(userId: number) {
    const json = await fetchJson(`${API_URL}/users/${userId}/lands`)
    return json?.data ?? []
}

async function deleteLand(id: number) {
        await fetchJson(`${API_URL}/lands/${id}`, { method: 'DELETE' })
        return true
}

// Fetch Notifications
async function getNotifications(userId: number) {
    try {
        const json = await fetchJson(`${API_URL}/users/${userId}/notifications`)
        return json?.data ?? []
    } catch (err: any) {
        const msg = String(err?.message || '')
        if (msg.includes('status 404') || msg.includes('Cannot GET') || msg.includes('404')) {
            return []
        }
        throw err
    }
}

// API Logout
async function logoutUser() {
        const json = await fetchJson(`${API_URL}/logout`, { method: 'POST' })
        return json ?? true
}

function RouteComponent() {
    const [activeTab, setActiveTab] = useState('lands');
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

    // --- Queries & Mutations ---

    const {
        data: lands,
        isLoading: isLoadingLands,
        isError: isErrorLands,
        error: errorLands,
    } = useQuery({
        queryKey: ["lands", user?.id],
        queryFn: () => getUserLands(user!.id),
        enabled: !!user?.id,
    });

    // Query Notifications
    const {
        data: notifications,
        isLoading: isLoadingNotif,
        isError: isErrorNotif,
        error: errorNotif,
    } = useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: () => getNotifications(user!.id),
        enabled: !!user?.id,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLand,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["lands", user?.id] });
        },
        onError: (err: Error) => {
          alert(err.message);
        },
    });

    // Logout Mutation
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
        { id: 'lands', label: 'lands' },
        { id: 'notifications', label: 'notifications' },
        { id: 'profile', label: 'profile' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'lands':
                if (isLoadingLands) {
                    return (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading lands...</span>
                        </div>
                    );
                }
                if (isErrorLands) {
                    return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700">{(errorLands as Error).message}</p>
                        </div>
                    );
                }
                if (lands && lands.length === 0) {
                    return (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">You have no lands yet.</p>
                            <button
                                onClick={() => navigate({ to: '/client/land/create' })}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Add Your First Land
                            </button>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Size (Ha)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lands.map((land: any) => (
                                        <tr key={land.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{land.location_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{land.size} Ha</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => navigate({ to: `/client/land/${land.id}` })}
                                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate({ to: `/client/land/${land.id}/update` })}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                                                        onClick={() => {
                                                            if (confirm(`Delete ${land.location_name}?`)) {
                                                                deleteMutation.mutate(land.id);
                                                            }
                                                        }}
                                                        disabled={deleteMutation.isPending}
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
            
            // KONTEN TAB NOTIFICATION (Desain Disamakan)
            case 'notifications':
                if (isLoadingNotif) {
                    return (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading notifications...</span>
                        </div>
                    );
                }
                if (isErrorNotif) {
                    return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700">{(errorNotif as Error).message}</p>
                        </div>
                    );
                }
                if (notifications && notifications.length === 0) {
                    return (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No new notifications.</p>
                        </div>
                    );
                }

                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-16">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {notifications.map((notif: any, index: number) => (
                                        <tr key={notif.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-center text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <Bell size={18} className="mt-0.5 text-blue-500 shrink-0" />
                                                    <span className="text-gray-900">{notif.description}</span>
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
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
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
                <Header />
                <NotificationCenter />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Client Dashboard</h2>
                            <p className="text-sm text-gray-600">Manage your palm oil plantations</p>
                        </div>
                        {activeTab === 'lands' && (
                            <button
                                onClick={() => navigate({ to: '/client/land/create' })}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-sm"
                            >
                                + Add Land
                            </button>
                        )}
                    </div>

                    <nav aria-label="Tabs" className="flex space-x-2 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}
                            </button>
                        ))}
                    </nav>

                    <Card>
                        {renderTabContent()}
                    </Card>
                </div>
            </div>
    )
}