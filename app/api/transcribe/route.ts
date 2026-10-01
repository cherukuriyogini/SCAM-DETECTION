import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Transcription service is not configured. Please add GROQ_API_KEY to .env.local. Get a free key at https://console.groq.com/keys",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided in request." },
        { status: 400 }
      );
    }

    // 25MB size limit (Groq supports up to 25MB for Whisper)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Audio file exceeds maximum size limit (25MB). Please upload a smaller file.",
        },
        { status: 400 }
      );
    }

    // Allowed extensions
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["mp3", "wav", "m4a", "webm", "ogg", "mpeg", "mp4", "flac"];
    if (ext && !validExtensions.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported audio format (.${ext}). Supported formats: MP3, WAV, M4A, WEBM, FLAC.`,
        },
        { status: 400 }
      );
    }

    // Groq Whisper API — fully OpenAI-compatible endpoint
    const model = process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3";

    const groqFormData = new FormData();
    groqFormData.append("file", file, file.name);
    groqFormData.append("model", model);
    groqFormData.append("response_format", "verbose_json");

    let response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    // If configured model not recognized, retry with the standard whisper-large-v3
    if (!response.ok && model !== "whisper-large-v3") {
      const fallbackFormData = new FormData();
      fallbackFormData.append("file", file, file.name);
      fallbackFormData.append("model", "whisper-large-v3");
      fallbackFormData.append("response_format", "verbose_json");

      response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: fallbackFormData,
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message || "Transcription failed.";
      console.error("Groq Speech-to-Text Error:", message);

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid Groq API Key. Please verify GROQ_API_KEY in .env.local. Get a free key at https://console.groq.com/keys",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `We couldn't transcribe this audio. ${message}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawTranscript = data.text || "";
    const duration = data.duration ? Math.round(data.duration) : undefined;

    return NextResponse.json({
      success: true,
      transcript: rawTranscript,
      duration,
    });
  } catch (error) {
    console.error("Transcription API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "We couldn't transcribe this audio. Please check your API configuration and try again.",
      },
      { status: 500 }
    );
  }
}
