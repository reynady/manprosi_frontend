import { API_URL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogIn, Leaf, Shield, UserCog, Users } from "lucide-react";
// No top header on login page — header is part of authenticated layout
// (do not import Header or NotificationCenter here)
import Card from '@/components/ui/Card'
import { useNotificationStore } from '@/stores/useNotificationStore'
import fetchJson from '@/lib/safeFetch'

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

type LoginRole = "admin" | "farmer" | "consultant" | null;

async function loginUser(credentials: { username: string; password: string }) {
  try {
    const json = await fetchJson(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!json?.success) throw new Error(json?.error || "Login failed");
    return json.data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Tidak dapat terhubung ke server. Pastikan backend API berjalan di ${API_URL}. ` +
        `Periksa juga apakah server sudah di-start dan CORS sudah dikonfigurasi dengan benar.`
      );
    }
    throw error;
  }
}

function RouteComponent() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    role?: string;
    username?: string;
    password?: string;
    server?: string;
  }>({});

  const notify = useNotificationStore((s) => s.push)

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      // Backend is single source of truth for role. Accept role from server and redirect accordingly.
      const role = (user.role || '').toLowerCase();
      setUser(user);
      queryClient.setQueryData(["auth"], user);

      if (role === "admin") navigate({ to: "/admin" });
      else if (role === "client" || role === "farmer") navigate({ to: "/client" });
      else if (role === "consultant") navigate({ to: "/consultant" });
    },
    onError: (err: Error) => {
      setErrors({ server: err.message });
      notify({ type: 'error', title: 'Login failed', message: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({ username, password });
  };

  const roleOptions = [
    {
      id: "admin" as LoginRole,
      label: "Admin",
      icon: Shield,
      description: "System Administrator",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
    },
    {
      id: "farmer" as LoginRole,
      label: "Farmer",
      icon: Users,
      description: "Palm Oil Farmer",
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
    {
      id: "consultant" as LoginRole,
      label: "Consultant",
      icon: UserCog,
      description: "Agricultural Consultant",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
  ];

  const getSelectedRoleConfig = () => {
    return roleOptions.find((r) => r.id === selectedRole);
  };

  const selectedConfig = getSelectedRoleConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="rounded-2xl shadow-xl p-8 border-green-100">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${
              selectedConfig?.color || "from-green-500 to-emerald-600"
            } rounded-full mb-4 transition-all`}>
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Palm Oil Monitoring
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      setErrors((prev) => ({ ...prev, role: undefined, server: undefined }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `${role.borderColor} ${role.bgColor} border-2`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${
                        isSelected ? role.color : "from-gray-400 to-gray-500"
                      }`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className={`font-semibold ${
                          isSelected ? role.textColor : "text-gray-900"
                        }`}>
                          {role.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Error Message */}
          {errors.server && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{errors.server}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="Enter your username"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.username
                    ? "border-red-300 focus:ring-red-500"
                    : selectedRole === "admin"
                    ? "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                    : selectedRole === "farmer"
                    ? "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    : selectedRole === "consultant"
                    ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500"
                    : selectedRole === "admin"
                    ? "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                    : selectedRole === "farmer"
                    ? "border-gray-300 focus:ring-green-500 focus:border-green-500"
                    : selectedRole === "consultant"
                    ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className={`w-full bg-gradient-to-r ${
                selectedConfig?.color || "from-green-500 to-emerald-600"
              } text-white py-3 px-4 rounded-lg font-semibold ${
                selectedConfig?.hoverColor || "hover:from-green-600 hover:to-emerald-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md`}
            >
              {mutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In as {selectedRole ? roleOptions.find(r => r.id === selectedRole)?.label : "User"}</span>
                </>
              )}
            </button>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 Palm Oil Monitoring System
        </p>
      </div>
    </div>
  );
}
