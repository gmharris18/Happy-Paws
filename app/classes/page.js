"use client";

import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api";

function ClassCard({ c, onBook }) {
  const spotsLeft = c.Capacity - c.BookedCount;
  const full = spotsLeft <= 0 || c.Status === "Full";
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{c.Title}</h2>
          <p className="text-xs text-slate-500">
            {c.Type} • {c.SkillLevel} • {c.Location || "Happy Paws Center"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            ${Number(c.Price).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(c.StartDateTime).toLocaleString()}
          </div>
        </div>
      </div>
      {c.Description && (
        <p className="text-sm text-slate-600 line-clamp-3">{c.Description}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
            {c.TrainerName?.[0]}
          </span>
          <span className="text-slate-600">{c.TrainerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              full
                ? "bg-slate-100 text-slate-600"
                : spotsLeft <= 2
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {full ? "Full" : `${spotsLeft} spots left`}
          </span>
        </div>
      </div>
      <div className="pt-1">
        <button
          disabled={full}
          onClick={() => onBook(c)}
          className="btn-primary w-full"
        >
          {full ? "Class full" : "Book this class"}
        </button>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiCall("/api/classes");
        setClasses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleBook(c) {
    setMessage("");
    setError("");
    const customerId = window.prompt(
      "Enter your Customer ID (for demo purposes):"
    );
    const petId = window.prompt("Enter the Pet ID you want to book for:");
    if (!customerId || !petId) return;
    try {
      await apiCall("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          customerId: Number(customerId),
          petId: Number(petId),
          classId: c.ClassID
        })
      });
      setMessage("Booking confirmed!");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Browse classes
          </h1>
          <p className="text-sm text-slate-600">
            Find the perfect group class or private session for your pet.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading classes…</p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-slate-500">
          No upcoming classes are available yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((c) => (
            <ClassCard key={c.ClassID} c={c} onBook={handleBook} />
          ))}
        </div>
      )}
    </div>
  );
}
