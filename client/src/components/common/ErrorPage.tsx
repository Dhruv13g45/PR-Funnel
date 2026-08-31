import { Activity, ArrowLeft, Compass, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-removebg-preview.png";
import QuietInteractiveBackdrop from "./QuietInteractiveBackdrop";

const ErrorPage = () => {
  return (
    <QuietInteractiveBackdrop>
      <main className="min-h-screen px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
          <header className="flex items-center justify-between border-b border-slate-800/70 pb-5">
            <Link to="/" className="group flex items-center gap-3">
              <img
                src={logo}
                alt="PR Funnel logo"
                className="size-12 object-contain transition duration-300 group-hover:rotate-[-6deg]"
              />
              <span>
                <span className="block text-[15px] font-bold tracking-wide text-white">
                  PR Funnel
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">
                  Code intelligence platform
                </span>
              </span>
            </Link>
            <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:flex">
              <Activity className="size-3.5 text-emerald-400" />
              Systems ready
            </div>
          </header>

          <section className="flex flex-1 items-center justify-center py-16">
            <div className="grid w-full max-w-4xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/35 p-8 shadow-2xl shadow-slate-950/20 sm:min-h-80">
                <div
                  aria-hidden="true"
                  className="absolute inset-5 rounded-xl border border-dashed border-sky-400/15"
                />
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-sky-400/20 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"
                />
                <div className="relative text-center">
                  <SearchX className="mx-auto size-8 text-sky-300" />
                  <p className="mt-5 text-8xl font-semibold leading-none tracking-[-0.08em] text-white sm:text-9xl">
                    404
                  </p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400/70">
                    Route not indexed
                  </p>
                </div>
              </div>

              <div className="max-w-xl">
                <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">
                  <span className="size-1.5 rounded-full bg-rose-400" />
                  Signal lost
                </div>
                <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  This pull request went off the map.
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
                  The page you requested does not exist, or its route has moved
                  to another branch. Let&apos;s get you back to a place where
                  the work is visible.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
                  >
                    <ArrowLeft className="size-4" />
                    Return home
                  </Link>
                  <Link
                    to="/sign-in"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 text-sm font-semibold text-slate-200 transition hover:border-sky-400/50 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
                  >
                    <Compass className="size-4" />
                    Open workspace
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-3 border-t border-slate-800/70 pt-5 text-xs text-slate-600">
                  <span className="font-mono text-sky-400/70">
                    ERR_ROUTE_404
                  </span>
                  <span className="size-1 rounded-full bg-slate-700" />
                  <span>Request could not be resolved</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </QuietInteractiveBackdrop>
  );
};

export default ErrorPage;
