import { NextRequest, NextResponse } from "next/server";
import {
  validateFile,
  parseAndValidateOptions,
  isApiError,
} from "@/app/lib/validation";
import { generateAllIcons } from "@/app/lib/generate-icons";
import { buildZip } from "@/app/lib/build-zip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract file
    const file = formData.get("image");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate file
    const fileError = validateFile(file);
    if (fileError) {
      const status = fileError.error === "FILE_TOO_LARGE" ? 413 : 400;
      return NextResponse.json(fileError, { status });
    }

    // Parse and validate options
    const rawOptions = formData.get("options") ?? "";
    const optionsResult = parseAndValidateOptions(rawOptions);
    if (isApiError(optionsResult)) {
      return NextResponse.json(optionsResult, { status: 400 });
    }

    // Process image
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const icons = await generateAllIcons(inputBuffer, optionsResult);

    // Build ZIP
    const zipBuffer = await buildZip(icons, optionsResult);

    // Return attachment
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="faviconkit.zip"',
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
