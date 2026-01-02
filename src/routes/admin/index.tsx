import { API_URL } from '@/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { Pencil, Trash, LogOut } from 'lucide-react';
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute('/admin/')({
    component: RouteComponent,
})

async function getUsers() {
    const json = await fetchJson(`${API_URL}/users`)
    return json?.data ?? []
}

async function deleteUser(id: number) {
    await fetchJson(`${API_URL}/users/${id}`, { method: 'DELETE' })
    return true
}

async function logoutUser() {
    const json = await fetchJson(`${API_URL}/logout`, { method: 'POST' })
    return json ?? true
}

function getRoleName(roleId: number): string {
    switch (roleId) {
        case 1:
            return "Admin";
        case 2:
            return "Consultant";
        case 3:
            return "Farmer";
        default:
            return "Unknown";
    }
}

function RouteComponent() {
    const [activeTab, setActiveTab] = useState('users');

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

    // --- Queries & Mutations ---

    const {
        data: users,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
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
        { id: 'users', label: 'users' },
        { id: 'roles', label: 'user roles' },
        { id: 'profile', label: 'profile' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                if (isLoading) {
                    return (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading users...</span>
                        </div>
                    );
                }
                if (isError) {
                    return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700">{(error as Error).message}</p>
                        </div>
                    );
                }
                if (users && users.length === 0) {
                    return (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No users found.</p>
                        </div>
                    );
                }

                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {getRoleName(u.user_role_id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate({ to: `/admin/update-user/${u.id}` })}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete ${u.username}?`)) {
                                                                deleteMutation.mutate(u.id);
                                                            }
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                        title="Delete User"
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

            case 'roles':
                // Static view untuk roles karena tidak ada API roles di contoh awal
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Admin</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">System administrator with full access</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Farmer</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">Palm oil plantation owner/manager</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Consultant</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">Agricultural consultant providing recommendations</td>
                                    </tr>
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
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium capitalize">
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
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage users and system settings</p>
                    </div>

                    {activeTab === 'users' && (
                        <button
                            onClick={() => navigate({ to: '/admin/create-user' })}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-sm"
                        >
                            + Create User
                        </button>
                    )}
                </div>

                <nav aria-label="Tabs" className="flex space-x-1 border-b border-gray-200 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                                }`}
                        >
                            {tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}
                        </button>
                    ))}
                </nav>

                {renderTabContent()}
            </div>
        </div>
    )
}