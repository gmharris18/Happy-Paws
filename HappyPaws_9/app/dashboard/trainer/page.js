"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

export default function TrainerDashboardPage() {
  const [trainerId, setTrainerId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [classForm, setClassForm] = useState({
    title: "",
    description: "",
    type: "Group",
    skillLevel: "Beginner",
    startDateTime: "",
    endDateTime: "",
    capacity: 8,
    price: 65,
    location: ""
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("hpt_trainer_id");
    if (stored) setTrainerId(stored);
  }, []);

  useEffect(() => {
    if (!trainerId) return;
    async function load() {
      try {
        setLoading(true);
        const [classesRes, bookingsRes, analyticsRes] = await Promise.all([
          fetch(`/api/classes?trainerId=${trainerId}`),
          fetch(`/api/bookings?trainerId=${trainerId}`),
          fetch(`/api/analytics?trainerId=${trainerId}`)
        ]);
        const [classesData, bookingsData, analyticsData] = await Promise.all([
          classesRes.json(),
          bookingsRes.json(),
          analyticsRes.json()
        ]);
        if (!classesRes.ok)
          throw new Error(classesData.message || "Unable to load classes");
        if (!bookingsRes.ok)
          throw new Error(bookingsData.message || "Unable to load bookings");
        if (!analyticsRes.ok)
          throw new Error(
            analyticsData.message || "Unable to load analytics"
          );
        setClasses(classesData);
        setBookings(bookingsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trainerId]);

  async function handleCreateClass(e) {
    e.preventDefault();
    if (!trainerId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, ...classForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to create class");
      setClassForm({
        title: "",
        description: "",
        type: "Group",
        skillLevel: "Beginner",
        startDateTime: "",
        endDateTime: "",
        capacity: 8,
        price: 65,
        location: ""
      });
      const refreshed = await fetch(`/api/classes?trainerId=${trainerId}`);
      setClasses(await refreshed.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadRoster(classId) {
    if (!classId) return;
    setSelectedClassId(classId);
    setLoadingRoster(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?classId=${classId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to load roster");
      setRoster(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRoster(false);
    }
  }

  async function handleUpdateClass(classId, partial) {
    if (!classId) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to update class");
      const refreshed = await fetch(`/api/classes?trainerId=${trainerId}`);
      setClasses(await refreshed.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!trainerId) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Trainer dashboard</h1>
        <p className="text-sm text-slate-600">
          To access your schedule and analytics, log in as a trainer.
        </p>
        <a href="/login" className="btn-primary mt-4 inline-flex">
          Go to login
        </a>
      </div>
    );
  }

  const upcoming = classes.filter(
    (c) => new Date(c.StartDateTime) > new Date()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Trainer dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Manage your schedule, balance class loads, and track performance.
          </p>
        </div>
      </div>
      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Upcoming classes
            </h2>
          </div>
          {loading ? (
            <p className="text-xs text-slate-500">Loading schedule…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-xs text-slate-500">
              No upcoming classes yet. Create a new one on the right.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {upcoming.map((c) => (
                <li
                  key={c.ClassID}
                  className="py-3 flex flex-col gap-2 border-b last:border-b-0"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">
                        {c.Title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(c.StartDateTime).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}{" "}
                        • {c.Type} • {c.SkillLevel}
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>
                        {c.BookedCount}/{c.Capacity} booked
                      </div>
                      <div className="font-medium text-slate-900">
                        ${Number(c.Price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => handleLoadRoster(c.ClassID)}
                      className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View roster
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Status:</span>
                      <select
                        value={c.Status}
                        onChange={(e) =>
                          handleUpdateClass(c.ClassID, {
                            status: e.target.value
                          })
                        }
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px]"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Full">Full</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Create new class
          </h2>
          <form onSubmit={handleCreateClass} className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Title
              </label>
              <input
                required
                value={classForm.title}
                onChange={(e) =>
                  setClassForm({ ...classForm, title: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                value={classForm.description}
                onChange={(e) =>
                  setClassForm({ ...classForm, description: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Type
                </label>
                <select
                  value={classForm.type}
                  onChange={(e) =>
                    setClassForm({ ...classForm, type: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Group">Group</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Skill level
                </label>
                <select
                  value={classForm.skillLevel}
                  onChange={(e) =>
                    setClassForm({ ...classForm, skillLevel: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Start
                </label>
                <input
                  type="datetime-local"
                  required
                  value={classForm.startDateTime}
                  onChange={(e) =>
                    setClassForm({
                      ...classForm,
                      startDateTime: e.target.value
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">End</label>
                <input
                  type="datetime-local"
                  required
                  value={classForm.endDateTime}
                  onChange={(e) =>
                    setClassForm({
                      ...classForm,
                      endDateTime: e.target.value
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  value={classForm.capacity}
                  onChange={(e) =>
                    setClassForm({
                      ...classForm,
                      capacity: Number(e.target.value)
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Price ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={classForm.price}
                  onChange={(e) =>
                    setClassForm({
                      ...classForm,
                      price: Number(e.target.value)
                    })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Location
                </label>
                <input
                  value={classForm.location}
                  onChange={(e) =>
                    setClassForm({ ...classForm, location: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? "Saving…" : "Create class"}
            </button>
          </form>
        </section>
      </div>

      {selectedClassId && (
        <section className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Class roster
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedClassId(null);
                setRoster([]);
              }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          {loadingRoster ? (
            <p className="text-xs text-slate-500">Loading roster…</p>
          ) : roster.length === 0 ? (
            <p className="text-xs text-slate-500">
              No bookings yet for this class.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-xs">
              {roster.map((b) => (
                <li key={b.BookingID} className="py-2 flex justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      {b.PetName}
                    </div>
                    <div className="text-slate-500">
                      Booked {new Date(b.BookingDateTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-slate-500">
                    <div>{b.Status}</div>
                    <div>${Number(b.PricePaid).toFixed(2)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="card p-5 space-y-6">
        <h2 className="text-sm font-semibold text-slate-800">
          Performance &amp; analytics
        </h2>
        {!analytics ? (
          <p className="text-xs text-slate-500">Loading analytics…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">
                Revenue trend
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="Month" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">
                Class demand (top)
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.classDemand}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="Title"
                      fontSize={9}
                      interval={0}
                      tick={{ angle: -30, textAnchor: "end" }}
                    />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar
                      dataKey="BookingsCount"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


