type Props = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children }: Props) {
    return (
        <div className="min-h-screen w-screen grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
            <aside
                className="relative hidden lg:block overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url(/bg.jpg)" }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />

                {/* Logo */}
                <div className="absolute left-8 top-8 text-4xl font-semibold font-primary text-white tracking-wide">
                    Trading Center
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center px-16 capitalize">
                    {/* Header */}
                    <h1 className="mt-3 font-semibold text-slate-100 [text-shadow:3px_6px_5px_#275382] tracking-wider">
                        TRADE WITH VIRTUAL CASH
                    </h1>
                    {/* Sub-header */}
                    <p className="mt-5 max-w-md text-md font-md text-white">
                        No real money was harmed in the making of this portfolio.
                    </p>
                </div>
            </aside>
            {/* Main section */}
            <main className="relative flex items-center justify-center bg-zinc-900 px-6 py-12">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
                    <h2 className="text-2xl font-semibold text-white">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </main>
        </div>
    )
}

