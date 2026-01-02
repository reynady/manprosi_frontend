import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { API_URL } from "@/constants";
import Header from "@/components/Header";
import NotificationCenter from "@/components/NotificationCenter";
import BackButton from "@/components/BackButton";
import Card from "@/components/ui/Card";
import { useNotificationStore } from "@/stores/useNotificationStore";
import fetchJson from "@/lib/safeFetch";

export const Route = createFileRoute("/admin/create-user")({
  component: RouteComponent,
});

async function createUserRequest(payload: {
  username: string;
  password: string;
  user_role_id: number;
}) {
  const res = await fetchJson(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res?.success) {
    throw new Error(res?.error || "Failed to create user");
  }

  return res.data;
}

function RouteComponent() {
  const navigate = useNavigate();
  const notify = useNotificationStore((s) => s.push);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRoleId, setUserRoleId] = useState("");

  const mutation = useMutation({
    mutationFn: createUserRequest,
    onSuccess: () => {
      notify({
        type: "success",
        title: "Success",
        message: "User created successfully",
      });
      navigate({ to: "/admin" });
    },
    onError: (err: Error) => {
      notify({
        type: "error",
        title: "Create failed",
        message: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({
      username,
      password,
      user_role_id: Number(userRoleId),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationCenter />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Create User</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              placeholder="Username"
              className="w-full border px-3 py-2 rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              required
              type="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              required
              className="w-full border px-3 py-2 rounded"
              value={userRoleId}
              onChange={(e) => setUserRoleId(e.target.value)}
            >
              <option value="">Select role</option>
              <option value="1">Admin</option>
              <option value="2">Consultant</option>
              <option value="3">Farmer</option>
            </select>

            <div className="flex justify-end gap-2">
              <BackButton to="/admin" />
              <button
                disabled={mutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {mutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
