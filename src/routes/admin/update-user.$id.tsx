import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchJson from "@/lib/safeFetch";
import { API_URL } from "@/constants";

import Header from "@/components/Header";
import NotificationCenter from "@/components/NotificationCenter";
import BackButton from "@/components/BackButton";
import Card from "@/components/ui/Card";
import { useNotificationStore } from "@/stores/useNotificationStore";

export const Route = createFileRoute("/admin/update-user/$id")({
  component: RouteComponent,
});

async function getUserById(id: string) {
  const res = await fetchJson(`${API_URL}/users/${id}`);
  if (!res?.data) throw new Error("User not found");
  return res.data;
}

async function updateUser(payload: {
  id: string;
  username: string;
  user_role_id: number;
}) {
  const res = await fetchJson(`${API_URL}/users/${payload.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: payload.username,
      user_role_id: payload.user_role_id,
    }),
  });

  if (!res?.success) {
    throw new Error(res?.error || "Update failed");
  }

  return res.data;
}

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.push);

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
  });

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      notify({
        type: "success",
        title: "Success",
        message: "User updated successfully",
      });
      navigate({ to: "/admin" });
    },
    onError: (err: Error) => {
      notify({
        type: "error",
        title: "Update failed",
        message: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    mutation.mutate({
      id,
      username: fd.get("username") as string,
      user_role_id: Number(fd.get("user_role_id")),
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{(error as Error).message}</p>;
  if (!user) return null; // 🔥 ANTI undefined.username

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">Edit User</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="username"
              defaultValue={user.username}
              required
              className="w-full border px-3 py-2 rounded"
            />

            <select
              name="user_role_id"
              defaultValue={user.user_role_id}
              className="w-full border px-3 py-2 rounded"
            >
              <option value={1}>Admin</option>
              <option value={2}>Consultant</option>
              <option value={3}>Farmer</option>
            </select>

            <div className="flex justify-end gap-2">
              <BackButton to="/admin" />
              <button
                disabled={mutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {mutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
