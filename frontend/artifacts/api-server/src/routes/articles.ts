import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetArticlesResponse,
  GetArticleContentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /articles/:sessionId
router.get("/articles/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const allArticles = await db
      .select()
      .from(articlesTable)
      .where(
        and(
          eq(articlesTable.sessionId, sessionId),
          eq(articlesTable.isApproved, true)
        )
      )
      .orderBy(articlesTable.score);

    const officialArticles = allArticles
      .filter((a) => a.category === "official")
      .sort((a, b) => b.score - a.score)
      .map((a) => ({
        id: a.id,
        session_id: a.sessionId,
        title: a.title,
        url: a.url,
        domain: a.domain,
        category: a.category as "official" | "trusted",
        score: a.score,
        snippet: a.snippet ?? undefined,
        is_approved: a.isApproved,
        default_selected: a.defaultSelected,
        user_selected: a.userSelected,
        published_date: a.publishedDate ?? undefined,
      }));

    const trustedArticles = allArticles
      .filter((a) => a.category === "trusted")
      .sort((a, b) => b.score - a.score)
      .map((a) => ({
        id: a.id,
        session_id: a.sessionId,
        title: a.title,
        url: a.url,
        domain: a.domain,
        category: a.category as "official" | "trusted",
        score: a.score,
        snippet: a.snippet ?? undefined,
        is_approved: a.isApproved,
        default_selected: a.defaultSelected,
        user_selected: a.userSelected,
        published_date: a.publishedDate ?? undefined,
      }));

    const data = GetArticlesResponse.parse({
      session_id: sessionId,
      official_articles: officialArticles,
      trusted_articles: trustedArticles,
      total_count: officialArticles.length + trustedArticles.length,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// GET /article-content?url=...
router.get("/article-content", async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: "url query param required" });
      return;
    }

    // In a real implementation, this would fetch and extract the article content
    // For the demo, we return mock extracted content
    const data = GetArticleContentResponse.parse({
      url,
      title: "Article Content",
      content: `This article explores key insights and developments related to the topic you're researching. 

The content covers multiple angles and perspectives from authoritative sources, providing a comprehensive view of current trends, challenges, and opportunities in this domain.

Key highlights from this article include detailed analysis of recent developments, expert commentary from industry leaders, statistical data supporting the findings, and forward-looking insights based on current trajectories.

The article was retrieved and processed by our AI research system, which evaluated it for relevance, authority, and factual accuracy before including it in your research session.`,
      can_embed: false,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
});

export default router;
