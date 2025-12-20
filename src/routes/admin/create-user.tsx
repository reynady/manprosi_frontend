import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { API_URL } from "@/constants";
import Header from '@/components/Header'
import NotificationCenter from '@/components/NotificationCenter'
import BackButton from '@/components/BackButton'
import Card from '@/components/ui/Card'
import { useNotificationStore } from '@/stores/useNotificationStore'

export const Route = createFileRoute("/admin/create-user")({
  component: RouteComponent,
});

async function createUserRequest(payload: {
  username: string;
  password: string;
  user_role_id: number;
}) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create user");
  }

  return data.data;
}

function RouteComponent() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRoleId, setUserRoleId] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    role?: string;
    server?: string;
  }>({});

  const notify = useNotificationStore((s) => s.push)

  const mutation = useMutation({
    mutationFn: createUserRequest,
    onSuccess: () => {
      notify({ type: 'success', title: 'User created', message: `User ${username} created` })
      navigate({ to: "/admin" });
    },
    onError: (err: Error) => {
      setErrors({ server: err.message });
      notify({ type: 'error', title: 'Create user failed', message: err.message })
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (!userRoleId) newErrors.role = "User role is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
            {errors.server && <div className="text-red-600">{errors.server}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
              {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                className="w-full px-3 py-2 border rounded-md"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={userRoleId}
                onChange={(e) => setUserRoleId(e.target.value)}
              >
                <option value="">Select a role</option>
                <option value="1">Admin</option>
                <option value="2">Farmer</option>
                <option value="3">Consultant</option>
              </select>
              {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
            </div>

            <div className="flex items-center justify-end gap-3">
              <BackButton to="/admin" />
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md"
              >
                {mutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
