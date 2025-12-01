\"use client\";

/* Simple role-based login form (customer or trainer).
 * In a real deployment you would back this with NextAuth or a robust auth system.
 */
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      if (data.role === "trainer") {
        window.localStorage.setItem("hpt_trainer_id", data.trainerId);
        window.location.href = "/dashboard/trainer";
      } else {
        window.localStorage.setItem("hpt_customer_id", data.customerId);
        window.location.href = "/dashboard/customer";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card mt-4 p-8">
      <h1 className="text-xl font-semibold mb-2">Welcome back</h1>
      <p className="text-sm text-slate-600 mb  -4">
        Log in to manage your pet&apos;s classes or your training schedule.
      </p>
      {error && (
        <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Login as
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="customer">Customer</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing you in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-primary-600 hover:underline">
          Create one now
        </a>
      </p>
    </div>
  );
}


