import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/constants";
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'
import { useNotificationStore } from '@/stores/useNotificationStore'

export const Route = createFileRoute("/admin/update-user/$id")({
  component: RouteComponent,
});

async function getUserById(id: string) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch user");
  }

  return data.data;
}

async function updateUser({
  id,
  username,
  user_role_id,
}: {
  id: string;
  username: string;
  user_role_id: number;
}) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, user_role_id }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update user");
  }

  return data.data;
}

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.push)

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      notify({ type: 'success', title: 'User updated', message: 'User updated successfully' })
      navigate({ to: "/admin" });
    },
    onError: (err: Error) => {
      notify({ type: 'error', title: 'Update failed', message: err.message })
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const user_role_id = Number(formData.get("user_role_id"));
    updateMutation.mutate({ id, username, user_role_id });
  };

  if (isLoading) return <p>Loading user...</p>;
  if (isError) return <div className="max-w-2xl mx-auto p-4"><div className="text-red-600">{(error as Error).message}</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Edit User ID: {id}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                name="username"
                defaultValue={user.username}
                required
                type="text"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select name="user_role_id" defaultValue={user.user_role_id} className="w-full px-3 py-2 border rounded-md">
                <option value={1}>Admin</option>
                <option value={2}>Farmer</option>
                <option value={3}>Consultant</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <BackButton to="/admin" />
              <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md">
                {updateMutation.isPending ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>

          {updateMutation.isError && (
            <div className="mt-4 text-sm text-red-600">{(updateMutation.error as Error).message}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
