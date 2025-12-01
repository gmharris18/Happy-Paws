"use client";

import { useEffect, useState } from "react";

export default function CustomerDashboardPage() {
  const [customerId, setCustomerId] = useState(null);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [petForm, setPetForm] = useState({
    name: "",
    species: "Dog",
    breed: "",
    birthDate: "",
    notes: ""
  });
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookForm, setBookForm] = useState({
    petId: "",
    classId: ""
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("hpt_customer_id");
    if (stored) {
      setCustomerId(stored);
    }
  }, []);

  useEffect(() => {
    if (!customerId) return;
    async function loadPets() {
      try {
        const res = await fetch(`/api/pets?customerId=${customerId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load pets");
        setPets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPets(false);
      }
    }
    async function loadBookings() {
      try {
        const res = await fetch(`/api/bookings?customerId=${customerId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load bookings");
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingBookings(false);
      }
    }
    async function loadClasses() {
      try {
        const res = await fetch(`/api/classes`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load classes");
        setAvailableClasses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingClasses(false);
      }
    }
    loadPets();
    loadBookings();
    loadClasses();
  }, [customerId]);

  async function handleAddPet(e) {
    e.preventDefault();
    if (!customerId) return;
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, ...petForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to add pet");
      setPetForm({
        name: "",
        species: "Dog",
        breed: "",
        birthDate: "",
        notes: ""
      });
      const refreshed = await fetch(`/api/pets?customerId=${customerId}`);
      setPets(await refreshed.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancelBooking(bookingId) {
    setBookingMessage("");
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to cancel booking");
      setBookingMessage("Booking cancelled.");
      const refreshed = await fetch(`/api/bookings?customerId=${customerId}`);
      setBookings(await refreshed.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBookClass(e) {
    e.preventDefault();
    if (!customerId || !bookForm.petId || !bookForm.classId) return;
    setBookingMessage("");
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(customerId),
          petId: Number(bookForm.petId),
          classId: Number(bookForm.classId)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to book class");
      setBookingMessage("Class booked successfully.");
      setBookForm({ petId: "", classId: "" });
      const refreshed = await fetch(`/api/bookings?customerId=${customerId}`);
      setBookings(await refreshed.json());
    } catch (err) {
      setError(err.message);
    }
  }

  if (!customerId) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Customer dashboard</h1>
        <p className="text-sm text-slate-600">
          To use the dashboard, log in as a customer so we can load your pets
          and bookings.
        </p>
        <a href="/login" className="btn-primary mt-4 inline-flex">
          Go to login
        </a>
      </div>
    );
  }

  const upcoming = bookings.filter(
    (b) => new Date(b.StartDateTime) > new Date() && b.Status === "Booked"
  );
  const past = bookings.filter(
    (b) => new Date(b.StartDateTime) <= new Date()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-slate-600">
            Manage your pets, view upcoming classes, and keep track of your
            training history.
          </p>
        </div>
      </div>
      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {bookingMessage && (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {bookingMessage}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Your pets
            </h2>
          </div>
          {loadingPets ? (
            <p className="text-xs text-slate-500">Loading pets…</p>
          ) : pets.length === 0 ? (
            <p className="text-xs text-slate-500">
              No pets added yet. Add a pet to start booking classes.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {pets.map((pet) => (
                <li key={pet.PetID} className="py-2 flex justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      {pet.Name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {pet.Species}
                      {pet.Breed ? ` • ${pet.Breed}` : ""}
                    </div>
                  </div>
                  {pet.BirthDate && (
                    <div className="text-xs text-slate-500">
                      DOB:{" "}
                      {new Date(pet.BirthDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Add a new pet
          </h2>
          <form onSubmit={handleAddPet} className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Name
                </label>
                <input
                  required
                  value={petForm.name}
                  onChange={(e) =>
                    setPetForm({ ...petForm, name: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Species
                </label>
                <select
                  value={petForm.species}
                  onChange={(e) =>
                    setPetForm({ ...petForm, species: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Breed (optional)
                </label>
                <input
                  value={petForm.breed}
                  onChange={(e) =>
                    setPetForm({ ...petForm, breed: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Birth date
                </label>
                <input
                  type="date"
                  value={petForm.birthDate}
                  onChange={(e) =>
                    setPetForm({ ...petForm, birthDate: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Notes
              </label>
              <textarea
                rows={2}
                value={petForm.notes}
                onChange={(e) =>
                  setPetForm({ ...petForm, notes: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Save pet
            </button>
          </form>
        </section>
      </div>

      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Upcoming sessions
          </h2>
          <a href="/classes" className="text-xs text-primary-600">
            Browse more classes →
          </a>
        </div>
        {loadingBookings ? (
          <p className="text-xs text-slate-500">Loading bookings…</p>
        ) : upcoming.length === 0 ? (
          <p className="text-xs text-slate-500">
            You don&apos;t have any upcoming bookings yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {upcoming.map((b) => (
              <li key={b.BookingID} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium text-slate-900">
                    {b.ClassTitle || b.Title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {b.PetName} •{" "}
                    {new Date(b.StartDateTime).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                  <div className="font-medium text-slate-900">
                    ${Number(b.PricePaid).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{b.Status}</span>
                    {b.Status === "Booked" && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.BookingID)}
                        className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Book a new class
          </h2>
          <a href="/classes" className="text-xs text-primary-600">
            View all details →
          </a>
        </div>
        {loadingClasses ? (
          <p className="text-xs text-slate-500">Loading available classes…</p>
        ) : availableClasses.length === 0 ? (
          <p className="text-xs text-slate-500">
            No upcoming classes are currently available.
          </p>
        ) : pets.length === 0 ? (
          <p className="text-xs text-slate-500">
            Add a pet first, then you can book them into a class.
          </p>
        ) : (
          <form onSubmit={handleBookClass} className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Pet
                </label>
                <select
                  required
                  value={bookForm.petId}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, petId: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a pet…</option>
                  {pets.map((p) => (
                    <option key={p.PetID} value={p.PetID}>
                      {p.Name} ({p.Species})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Class
                </label>
                <select
                  required
                  value={bookForm.classId}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, classId: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a class…</option>
                  {availableClasses.map((c) => (
                    <option key={c.ClassID} value={c.ClassID}>
                      {c.Title} •{" "}
                      {new Date(c.StartDateTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}{" "}
                      @{" "}
                      {new Date(c.StartDateTime).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              Book class
            </button>
          </form>
        )}
      </section>
    </div>
  );
}


