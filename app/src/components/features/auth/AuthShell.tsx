type AuthProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthProps) {
  return (
    <div className="auth-shell">
      <aside
        className="auth-hero"
        style={{ backgroundImage: "url(/bg.jpg)" }}
      >
        {/* Overlay */}
        <div className="auth-hero-overlay" />

        {/* Logo */}
        <div className="auth-logo-text">
          Trading Center
        </div>

        <div className="auth-hero-content">
          {/* Header */}
          <h1 className="page-title auth-hero-title">
            TRADE WITH VIRTUAL CASH
          </h1>
          {/* Sub-header */}
          <p className="auth-hero-subtitle">
            No real money was harmed in the making of this portfolio.
          </p>
        </div>
      </aside>

      {/* Main section */}
      <main className="auth-main">
        <div className="auth-card">
          <h2 className="card-title-lg">{title}</h2>
          {subtitle && <p className="label-text mt-2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
