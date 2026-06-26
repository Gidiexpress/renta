import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

const DIDIT_BASE = "https://verification.didit.me";

// GET /api/verification/didit/session — Check if Didit is configured
export async function GET() {
  const apiKey =
    (await getSetting("DIDIT_API_KEY")) || process.env.DIDIT_API_KEY;
  const workflowId =
    (await getSetting("DIDIT_WORKFLOW_ID")) || process.env.DIDIT_WORKFLOW_ID;
  return NextResponse.json({
    configured: !!(apiKey && workflowId),
    hasApiKey: !!apiKey,
    hasWorkflowId: !!workflowId,
  });
}

// POST /api/verification/didit/session — Create a Didit verification session
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try DB settings first, then fall back to environment variables
    const apiKey =
      (await getSetting("DIDIT_API_KEY")) || process.env.DIDIT_API_KEY;
    const workflowId =
      (await getSetting("DIDIT_WORKFLOW_ID")) || process.env.DIDIT_WORKFLOW_ID;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      request.nextUrl.origin;

    if (!apiKey) {
      console.error(
        "[Didit] DIDIT_API_KEY is missing from both platform settings and environment variables",
      );
      return NextResponse.json(
        { error: "Verification service not configured: missing API key" },
        { status: 503 },
      );
    }
    if (!workflowId) {
      console.error(
        "[Didit] DIDIT_WORKFLOW_ID is missing from both platform settings and environment variables",
      );
      return NextResponse.json(
        { error: "Verification service not configured: missing workflow ID" },
        { status: 503 },
      );
    }

    const userId = String(session.user.id);

    console.log(
      `[Didit] Creating session for user ${userId} with workflow ${workflowId}`,
    );

    const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        callback: `${appUrl}/api/verification/didit/callback`,
        vendor_data: userId,
      }),
    });

    const responseText = await res.text();
    console.log(
      `[Didit] Session creation response (${res.status}):`,
      responseText,
    );

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (!res.ok) {
      console.error(
        "[Didit] Session creation failed:",
        res.status,
        responseText,
      );
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.message ||
            data?.detail ||
            "Failed to create verification session",
        },
        { status: res.status || 500 },
      );
    }

    const sessionId = data?.session_id || data?.sessionId || data?.id;
    const verificationUrl =
      data?.verification_url ||
      data?.verificationUrl ||
      data?.url ||
      data?.session_url ||
      data?.sessionUrl;

    if (!sessionId || !verificationUrl) {
      console.error("[Didit] Unexpected response shape:", data);
      return NextResponse.json(
        { error: "Invalid response from verification service" },
        { status: 500 },
      );
    }

    // Save session ID to the user record
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { diditSessionId: sessionId },
    });

    return NextResponse.json({
      verification_url: verificationUrl,
      session_id: sessionId,
    });
  } catch (error) {
    console.error("[Didit] Session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
