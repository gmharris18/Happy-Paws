import Link from "next/link";

const features = [
  {
    title: "Smart scheduling",
    description:
      "Let pet parents browse live availability for group classes and private lessons—no phone tag required."
  },
  {
    title: "Trainer tools",
    description:
      "Trainers manage class rosters, set capacities, adjust pricing, and track attendance in one place."
  },
  {
    title: "Insightful analytics",
    description:
      "Visualize revenue, class demand, trainer utilization, and cancellation trends in real time."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
            <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs">
              🐾
            </span>
            Modern scheduling for busy pet parents
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Book<br className="hidden sm:block" />
            <span className="text-primary-600"> happier training</span>{" "}
            sessions.
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
            Happy Paws Training (HPT) is a full-featured booking platform for
            group classes and private lessons—built for trainers, loved by pet
            parents.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Create customer account
            </Link>
            <Link href="/dashboard/trainer" className="btn-outline">
              Trainer dashboard →
            </Link>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 pt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Real-time availability</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Class &amp; private sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span>Actionable analytics</span>
            </div>
          </div>
        </div>
        <div className="card p-6 md:p-8 space-y-6">
          <h2 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
            Today at a glance
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500 mb-1">Bookings</div>
              <div className="text-2xl font-semibold text-slate-900">24</div>
              <div className="text-emerald-600 text-xs mt-1">+8 today</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500 mb-1">Revenue</div>
              <div className="text-2xl font-semibold text-slate-900">
                $1.9k
              </div>
              <div className="text-emerald-600 text-xs mt-1">+14%</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500 mb-1">Classes full</div>
              <div className="text-2xl font-semibold text-slate-900">6</div>
              <div className="text-slate-500 text-xs mt-1">of 9</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Upcoming sessions
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Puppy Socialization</div>
                  <div className="text-xs text-slate-500">
                    Today · 5:30 PM · w/ Alex Rivera
                  </div>
                </div>
                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  8 / 8 spots
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Reactive Rover 101</div>
                  <div className="text-xs text-slate-500">
                    Today · 7:00 PM · w/ Priya Patel
                  </div>
                </div>
                <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  2 spots left
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="card p-6 space-y-3">
            <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <span>★</span>
            </div>
            <h3 className="font-semibold text-slate-900">{feature.title}</h3>
            <p className="text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}


