export type Preset = "classic-web" | "nextjs-app-router";
export type Fit = "contain" | "cover";

export type Options = {
  preset: Preset;
  fit: Fit;
  paddingPct: number;
  background: "transparent" | `#${string}`;
  appName: string;
  shortName: string;
};

export type ErrorCode = "VALIDATION_ERROR" | "FILE_TOO_LARGE" | "INTERNAL_ERROR";

export type ApiError = {
  error: ErrorCode;
  details?: string;
};

export const DEFAULT_OPTIONS: Options = {
  preset: "classic-web",
  fit: "contain",
  paddingPct: 0,
  background: "transparent",
  appName: "My App",
  shortName: "MyApp",
};

const VALID_PRESETS: Preset[] = ["classic-web", "nextjs-app-router"];
const VALID_FITS: Fit[] = ["contain", "cover"];
const VALID_OPTION_KEYS = new Set<string>([
  "preset",
  "fit",
  "paddingPct",
  "background",
  "appName",
  "shortName",
]);
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const VALID_MIMES = new Set(["image/png", "image/jpeg"]);

const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export function validateFile(file: File): ApiError | null {
  if (file.size > MAX_FILE_SIZE) {
    return { error: "FILE_TOO_LARGE" };
  }
  const mimeOk = VALID_MIMES.has(file.type);
  const extOk = VALID_EXTENSIONS.has(getExtension(file.name));
  if (!mimeOk && !extOk) {
    return {
      error: "VALIDATION_ERROR",
      details: `Unsupported file type: ${file.type || "unknown"}. Only PNG and JPEG are accepted.`,
    };
  }
  return null;
}

export function parseAndValidateOptions(raw: unknown): Options | ApiError {
  if (raw === undefined || raw === null || raw === "") {
    return { ...DEFAULT_OPTIONS };
  }

  let parsed: Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: "VALIDATION_ERROR", details: "Invalid JSON in options." };
    }
  } else if (typeof raw === "object" && !Array.isArray(raw)) {
    parsed = raw as Record<string, unknown>;
  } else {
    return { error: "VALIDATION_ERROR", details: "Options must be a JSON object." };
  }

  // Reject unknown keys
  for (const key of Object.keys(parsed)) {
    if (!VALID_OPTION_KEYS.has(key)) {
      return { error: "VALIDATION_ERROR", details: `Unknown option key: "${key}".` };
    }
  }

  const opts: Options = { ...DEFAULT_OPTIONS };

  if ("preset" in parsed) {
    if (!VALID_PRESETS.includes(parsed.preset as Preset)) {
      return { error: "VALIDATION_ERROR", details: `Invalid preset: "${parsed.preset}".` };
    }
    opts.preset = parsed.preset as Preset;
  }

  if ("fit" in parsed) {
    if (!VALID_FITS.includes(parsed.fit as Fit)) {
      return { error: "VALIDATION_ERROR", details: `Invalid fit: "${parsed.fit}".` };
    }
    opts.fit = parsed.fit as Fit;
  }

  if ("paddingPct" in parsed) {
    const p = Number(parsed.paddingPct);
    if (isNaN(p)) {
      return { error: "VALIDATION_ERROR", details: "paddingPct must be a number." };
    }
    opts.paddingPct = Math.max(0, Math.min(0.2, p));
  }

  if ("background" in parsed) {
    const bg = parsed.background;
    if (bg !== "transparent" && (typeof bg !== "string" || !HEX_COLOR_RE.test(bg))) {
      return {
        error: "VALIDATION_ERROR",
        details: 'background must be "transparent" or "#RRGGBB".',
      };
    }
    opts.background = bg as Options["background"];
  }

  if ("appName" in parsed) {
    if (typeof parsed.appName !== "string") {
      return { error: "VALIDATION_ERROR", details: "appName must be a string." };
    }
    opts.appName = parsed.appName;
  }

  if ("shortName" in parsed) {
    if (typeof parsed.shortName !== "string") {
      return { error: "VALIDATION_ERROR", details: "shortName must be a string." };
    }
    opts.shortName = parsed.shortName;
  }

  return opts;
}

export function isApiError(v: unknown): v is ApiError {
  return typeof v === "object" && v !== null && "error" in v;
}
