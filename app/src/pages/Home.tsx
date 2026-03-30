import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function HomePage() {
  return (
    <main className="min-h-screen text-white">
      <div className="flex min-h-screen w-full flex-col gap-6">
        <header className="flex items-center justify-between">
          <button
            onClick={() => signOut(auth)}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
          >
            Sign out
          </button>
        </header>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="rounded-xl bg-black shadow-sm sm:p-5"></div>
          </div>
        </section>
      </div>
    </main>
  );
}
