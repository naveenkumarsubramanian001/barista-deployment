import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { searchSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GeneratePdfBody,
  GeneratePdfResponse,
  GetPdfStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// POST /generate-pdf/:sessionId
router.post("/generate-pdf/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const body = GeneratePdfBody.parse(req.body);

    const [session] = await db
      .select()
      .from(searchSessionsTable)
      .where(eq(searchSessionsTable.id, sessionId));

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Update session to show PDF is generating
    await db
      .update(searchSessionsTable)
      .set({ pdfStatus: "generating", updatedAt: new Date() })
      .where(eq(searchSessionsTable.id, sessionId));

    // Simulate PDF generation in background (3-5 seconds)
    simulatePdfGeneration(sessionId, body.selected_article_urls);

    const data = GeneratePdfResponse.parse({
      session_id: sessionId,
      status: "generating",
      message: `Generating PDF with ${body.selected_article_urls.length} selected insights`,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// GET /pdf-status/:sessionId
router.get("/pdf-status/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const [session] = await db
      .select()
      .from(searchSessionsTable)
      .where(eq(searchSessionsTable.id, sessionId));

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const data = GetPdfStatusResponse.parse({
      session_id: sessionId,
      status: (session.pdfStatus ?? "pending") as "pending" | "generating" | "completed" | "failed",
      download_url: session.pdfDownloadUrl ?? undefined,
      created_at: session.createdAt.toISOString(),
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

async function simulatePdfGeneration(sessionId: string, selectedUrls: string[]) {
  // Simulate 4-6 second PDF generation
  const delay = 4000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Mark PDF as completed with a mock download URL
  const downloadUrl = `/api/download-pdf/${sessionId}`;
  await db
    .update(searchSessionsTable)
    .set({ pdfStatus: "completed", pdfDownloadUrl: downloadUrl, updatedAt: new Date() })
    .where(eq(searchSessionsTable.id, sessionId));
}

export default router;
