import "./globals.css";

export const metadata = {
  title: "Happy Paws Training",
  description: "Pet training class scheduling and booking platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-20">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 text-xl font-black">HP</span>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight">
                    Happy Paws Training
                  </div>
                  <p className="text-xs text-slate-500">
                    Book classes & private pet training with ease
                  </p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
                <a href="/" className="hover:text-primary-600">
                  Home
                </a>
                <a href="/classes" className="hover:text-primary-600">
                  Classes
                </a>
                <a href="/dashboard/customer" className="hover:text-primary-600">
                  Customer Portal
                </a>
                <a href="/dashboard/trainer" className="hover:text-primary-600">
                  Trainer Portal
                </a>
              </nav>
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:text-primary-600"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                >
                  Get started
                </a>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
          </main>
          <footer className="border-t bg-white mt-8">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 flex justify-between">
              <span>© {new Date().getFullYear()} Happy Paws Training</span>
              <span>Built with Next.js &amp; MySQL</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}


