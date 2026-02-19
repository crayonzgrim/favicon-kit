"use client";

import { KakaoAdFit } from "@/app/components/kakao-adfit";
import { OptionsPanel } from "@/app/components/options-panel";
import { PreviewPanel } from "@/app/components/preview-panel";
import { UploadForm } from "@/app/components/upload-form";
import { DEFAULT_OPTIONS, type Options } from "@/app/lib/validation";
import { Check, ClipboardCopy, Image } from "lucide-react";
import { useCallback, useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Options>({ ...DEFAULT_OPTIONS });

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* AdFit - Mobile Top Banner */}
      <div className="flex justify-center xl:hidden">
        <KakaoAdFit unit="DAN-yqlPcmi0FcmMsCT3" width={320} height={100} />
      </div>

      {/* AdFit - Left Sidebar */}
      <div className="fixed left-4 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
        <KakaoAdFit unit="DAN-IAekLSsQbum86vEe" width={160} height={600} />
      </div>

      {/* AdFit - Right Sidebar */}
      <div className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
        <KakaoAdFit unit="DAN-sBjDQzTZuuaDoRBl" width={160} height={600} />
      </div>

      {/* Header */}
      <header className="border-b border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <Image className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Favicon Kit
            </span>
          </div>
          <span className="text-xs text-zinc-400">
            Favicon & App Icon Generator
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Generate your favicon package
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Upload a PNG or JPEG, configure options, and download a ready-to-use
            ZIP with all icon sizes, manifest, and head snippet.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left column: Upload + Preview */}
          <div className="space-y-8">
            <UploadForm
              options={options}
              onFileChange={setFile}
              file={file}
            />
            <PreviewPanel file={file} options={options} />
          </div>

          {/* Right column: Options */}
          <aside className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <OptionsPanel options={options} onChange={setOptions} />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl space-y-2 px-6 py-6 text-center text-xs text-zinc-400">
          <p>Favicon Kit — Free favicon generator. No sign-up required.</p>
          <p>
            Issues or feature requests? Contact{" "}
            <CopyEmail email="crayonzgrim@gmail.com" />
          </p>
        </div>
      </footer>
    </div>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [email]);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-medium text-zinc-600 dark:text-zinc-300">
        {email}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center rounded-md border border-zinc-200 px-1.5 py-0.5 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <ClipboardCopy className="h-3 w-3" />
        )}
      </button>
    </span>
  );
}
