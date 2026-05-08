import { clsx } from "../../utils/clsx";

export function Button({ variant = "primary", className, ...props }) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-[#22c55e] to-[#3b82f6] text-white shadow-sm hover:brightness-105"
      : variant === "secondary"
      ? "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
      : variant === "ghost"
      ? "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700";

  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
        styles,
        className
      )}
      {...props}
    />
  );
}

