import GithubButton from "@/features/auth/components/GithubButton";

const SignInPage = () => {


  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/95 p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-sky-300 shadow-inner shadow-slate-950/40">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path d="M12 0.5C5.8 0.5.8 5.6.8 11.8c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.9c-3.2.7-3.8-1.5-3.8-1.5-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.9.7 2.4 1.4.8 1.4 2.2 1 2.7.8.1-.7.3-1 .6-1.2-2.5-.3-5-1.3-5-5.9 0-1.3.5-2.4 1.2-3.2-.2-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.5 5.6-5.1 5.9.3.3.7.8.7 1.6v2.4c0 .3.2.7.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.2 5.6 18.2.5 12 .5Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Sign in with GitHub
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
            Access PR Funnel with your GitHub account and continue to your
            dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <GithubButton />

          <div className="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-4 text-sm text-slate-400">
            <p className="font-medium text-slate-200">One click login</p>
            <p className="mt-2 leading-6">
              You will be redirected to GitHub to authenticate securely. After
              approval, you’ll return to PR Funnel automatically.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignInPage;
