"use client";

import { useRef, useState, useCallback } from "react";
import { Check, Upload } from "lucide-react";
import type { Options } from "@/app/lib/validation";

type UploadFormProps = {
  options: Options;
  onFileChange: (file: File | null) => void;
  file: File | null;
};

export function UploadForm({ options, onFileChange, file }: UploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const validateAndSetFile = useCallback(
    (f: File | null) => {
      setError(null);
      if (!f) {
        onFileChange(null);
        return;
      }
      if (!["image/png", "image/jpeg"].includes(f.type)) {
        setError("Only PNG and JPEG files are accepted.");
        return;
      }
      if (f.size > 8 * 1024 * 1024) {
        setError("File must be under 8MB.");
        return;
      }
      onFileChange(f);
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSetFile(f);
    },
    [validateAndSetFile]
  );

  const handleSubmit = () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Hidden real form for download */}
      <form
        method="POST"
        action="/api/generate"
        encType="multipart/form-data"
        target="_blank"
        onSubmit={handleSubmit}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
        />
        <input type="hidden" name="options" value={JSON.stringify(options)} />

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
            dragOver
              ? "border-zinc-400 bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-800/50"
              : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {file.name}
              </p>
              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Upload className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Drop your image here or click to upload
              </p>
              <p className="text-xs text-zinc-400">PNG or JPEG, max 8 MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Generate button */}
        <button
          type="submit"
          disabled={!file}
          className="mt-4 w-full rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Generate & Download ZIP
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
          Generating ZIP... download will start in a new tab
        </div>
      )}
    </div>
  );
}
