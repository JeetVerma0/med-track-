export function Navbar({ title = "Med Track", subtitle, right }) {
  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <div className="text-xl font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{subtitle || "Welcome back."}</div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

