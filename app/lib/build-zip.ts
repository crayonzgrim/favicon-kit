import archiver from "archiver";
import type { Options } from "./validation";
import type { IconBuffers } from "./generate-icons";
import {
  generateWebManifest,
  generateHeadSnippet,
  generateManifestTs,
  generateReadme,
} from "./generate-manifest";

export async function buildZip(
  icons: IconBuffers,
  options: Options
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    if (options.preset === "nextjs-app-router") {
      appendNextjsPreset(archive, icons, options);
    } else {
      appendClassicPreset(archive, icons, options);
    }

    archive.finalize();
  });
}

function appendClassicPreset(
  archive: archiver.Archiver,
  icons: IconBuffers,
  options: Options
) {
  archive.append(icons.ico, { name: "public/favicon.ico" });
  archive.append(icons[16], { name: "public/favicon-16x16.png" });
  archive.append(icons[32], { name: "public/favicon-32x32.png" });
  archive.append(icons[48], { name: "public/favicon-48x48.png" });
  archive.append(icons[180], { name: "public/apple-touch-icon.png" });
  archive.append(icons[192], { name: "public/android-chrome-192x192.png" });
  archive.append(icons[512], { name: "public/android-chrome-512x512.png" });
  archive.append(generateWebManifest(options), {
    name: "public/site.webmanifest",
  });
  archive.append(generateHeadSnippet(), {
    name: "head-snippet.html",
  });
  archive.append(generateReadme("classic-web"), { name: "README.md" });
}

function appendNextjsPreset(
  archive: archiver.Archiver,
  icons: IconBuffers,
  options: Options
) {
  archive.append(icons.ico, { name: "app/favicon.ico" });
  archive.append(icons[32], { name: "app/icon.png" });
  archive.append(icons[180], { name: "app/apple-icon.png" });
  archive.append(generateManifestTs(options), { name: "app/manifest.ts" });
  archive.append(icons[192], { name: "public/android-chrome-192x192.png" });
  archive.append(icons[512], { name: "public/android-chrome-512x512.png" });
  archive.append(generateReadme("nextjs-app-router"), { name: "README.md" });
}
