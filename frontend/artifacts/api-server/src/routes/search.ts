import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { searchSessionsTable, articlesTable, workflowStagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  StartSearchBody,
  StartSearchResponse,
  GetWorkflowStatusResponse,
  GetSessionResponse,
} from "@workspace/api-zod";
import { generateMockArticles, WORKFLOW_STAGES } from "../lib/mock-data.js";

const router: IRouter = Router();

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// POST /search - Start a new search session
router.post("/search", async (req, res) => {
  try {
    const body = StartSearchBody.parse(req.body);
    const sessionId = generateSessionId();

    // Create session in DB
    await db.insert(searchSessionsTable).values({
      id: sessionId,
      query: body.query,
      workflowStatus: "running",
      currentStage: "analyze",
    });

    // Insert all workflow stages as pending
    for (const stage of WORKFLOW_STAGES) {
      await db.insert(workflowStagesTable).values({
        sessionId,
        stageId: stage.stageId,
        label: stage.label,
        description: stage.description,
        status: "pending",
        orderIndex: stage.orderIndex,
      });
    }

    // Start async mock workflow progression
    simulateWorkflow(sessionId, body.query);

    const data = StartSearchResponse.parse({ session_id: sessionId, status: "started" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: "Invalid request", details: String(err) });
  }
});

// GET /workflow/status/:sessionId
router.get("/workflow/status/:sessionId", async (req, res) => {
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

    const stages = await db
      .select()
      .from(workflowStagesTable)
      .where(eq(workflowStagesTable.sessionId, sessionId))
      .orderBy(workflowStagesTable.orderIndex);

    const completedCount = stages.filter((s) => s.status === "completed").length;
    const progressPercentage = Math.round((completedCount / stages.length) * 100);

    const data = GetWorkflowStatusResponse.parse({
      session_id: sessionId,
      status: session.workflowStatus as "pending" | "running" | "completed" | "failed",
      current_stage: session.currentStage,
      stages: stages.map((s) => ({
        id: s.stageId,
        label: s.label,
        status: s.status as "pending" | "running" | "completed" | "failed",
        description: s.description ?? undefined,
      })),
      progress_percentage: progressPercentage,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// GET /session/:sessionId
router.get("/session/:sessionId", async (req, res) => {
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

    const data = GetSessionResponse.parse({
      session_id: session.id,
      query: session.query,
      created_at: session.createdAt.toISOString(),
      workflow_status: session.workflowStatus,
      pdf_status: session.pdfStatus ?? "none",
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// Simulate workflow progression in background
async function simulateWorkflow(sessionId: string, query: string) {
  const stageDelays = [1200, 1800, 1400, 2000, 2500, 2200, 1600, 1300];

  for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
    const stage = WORKFLOW_STAGES[i];

    // Mark current stage as running
    await db
      .update(workflowStagesTable)
      .set({ status: "running" })
      .where(
        eq(workflowStagesTable.sessionId, sessionId) &&
        eq(workflowStagesTable.stageId, stage.stageId)
      );

    await db
      .update(searchSessionsTable)
      .set({ currentStage: stage.stageId, updatedAt: new Date() })
      .where(eq(searchSessionsTable.id, sessionId));

    // Wait for stage duration
    await new Promise((resolve) => setTimeout(resolve, stageDelays[i]));

    // Mark stage as completed
    await db
      .update(workflowStagesTable)
      .set({ status: "completed" })
      .where(
        eq(workflowStagesTable.sessionId, sessionId) &&
        eq(workflowStagesTable.stageId, stage.stageId)
      );
  }

  // Insert mock articles
  const { officialArticles, trustedArticles } = generateMockArticles(sessionId, query);

  for (const article of [...officialArticles, ...trustedArticles]) {
    await db.insert(articlesTable).values({
      id: article.id,
      sessionId: article.sessionId,
      title: article.title,
      url: article.url,
      domain: article.domain,
      category: article.category,
      score: article.score,
      snippet: article.snippet,
      isApproved: article.isApproved,
      defaultSelected: article.defaultSelected,
      userSelected: article.userSelected,
      publishedDate: article.publishedDate,
    });
  }

  // Mark workflow as completed
  await db
    .update(searchSessionsTable)
    .set({ workflowStatus: "completed", currentStage: "select", updatedAt: new Date() })
    .where(eq(searchSessionsTable.id, sessionId));
}

export default router;
