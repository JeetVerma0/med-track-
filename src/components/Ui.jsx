import { clsx } from "../utils/clsx";
export { Button } from "./common/Button";

export function Container({ children }) {
  return <div className="mx-auto w-full max-w-5xl px-4">{children}</div>;
}

export function Card({ className, children }) {
  return (
    <div className={clsx("rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p> : null}
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
        "h-11 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none ring-0 focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30",
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
        "h-11 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-white outline-none ring-0 focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30",
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
        "min-h-24 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30",
        className
      )}
      {...props}
    />
  );
}

