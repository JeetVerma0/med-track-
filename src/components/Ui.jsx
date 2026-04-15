import { clsx } from "../utils/clsx";
export { Button } from "./common/Button";

export function Container({ children }) {
  return <div className="mx-auto w-full max-w-5xl px-4">{children}</div>;
}

export function Card({ className, children }) {
  return (
    <div className={clsx("rounded-2xl bg-white shadow-sm ring-1 ring-gray-200", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none ring-0 focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={clsx(
        "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none ring-0 focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={clsx(
        "min-h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}

