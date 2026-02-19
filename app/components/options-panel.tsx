"use client";

import type { Options, Preset, Fit } from "@/app/lib/validation";

type OptionsPanelProps = {
  options: Options;
  onChange: (options: Options) => void;
};

export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const update = <K extends keyof Options>(key: K, value: Options[K]) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Options
      </h2>

      {/* Preset */}
      <Field label="Preset">
        <select
          value={options.preset}
          onChange={(e) => update("preset", e.target.value as Preset)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="classic-web">Classic Web</option>
          <option value="nextjs-app-router">Next.js App Router</option>
        </select>
      </Field>

      {/* Fit */}
      <Field label="Fit">
        <div className="flex gap-2">
          {(["contain", "cover"] as Fit[]).map((fit) => (
            <button
              key={fit}
              type="button"
              onClick={() => update("fit", fit)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                options.fit === fit
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </Field>

      {/* Padding */}
      <Field label={`Padding: ${Math.round(options.paddingPct * 100)}%`}>
        <input
          type="range"
          min={0}
          max={0.2}
          step={0.01}
          value={options.paddingPct}
          onChange={(e) => update("paddingPct", parseFloat(e.target.value))}
          className="w-full accent-zinc-900 dark:accent-zinc-100"
        />
      </Field>

      {/* Background */}
      <Field label="Background">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => update("background", "transparent")}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              options.background === "transparent"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
            }`}
          >
            Transparent
          </button>
          <div className="relative flex items-center">
            <input
              type="color"
              value={
                options.background !== "transparent"
                  ? options.background
                  : "#ffffff"
              }
              onChange={(e) =>
                update("background", e.target.value as `#${string}`)
              }
              className="h-9 w-9 cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700"
            />
          </div>
          {options.background !== "transparent" && (
            <span className="text-xs text-zinc-500">
              {options.background}
            </span>
          )}
        </div>
      </Field>

      {/* App Name */}
      <Field label="App Name">
        <input
          type="text"
          value={options.appName}
          onChange={(e) => update("appName", e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
          placeholder="My App"
        />
      </Field>

      {/* Short Name */}
      <Field label="Short Name">
        <input
          type="text"
          value={options.shortName}
          onChange={(e) => update("shortName", e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
          placeholder="MyApp"
        />
      </Field>

    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
