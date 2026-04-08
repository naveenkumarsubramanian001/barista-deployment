import { pgTable, text, serial, real, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const searchSessionsTable = pgTable("search_sessions", {
  id: text("id").primaryKey(),
  query: text("query").notNull(),
  workflowStatus: text("workflow_status").notNull().default("pending"),
  currentStage: text("current_stage"),
  pdfStatus: text("pdf_status").default("none"),
  pdfDownloadUrl: text("pdf_download_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(searchSessionsTable).omit({ createdAt: true, updatedAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type SearchSession = typeof searchSessionsTable.$inferSelect;

export const articlesTable = pgTable("articles", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => searchSessionsTable.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  category: text("category").notNull(),
  score: real("score").notNull().default(0),
  snippet: text("snippet"),
  extractedContent: text("extracted_content"),
  isApproved: boolean("is_approved").notNull().default(true),
  defaultSelected: boolean("default_selected").notNull().default(false),
  userSelected: boolean("user_selected").notNull().default(false),
  publishedDate: text("published_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({ createdAt: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;

export const workflowStagesTable = pgTable("workflow_stages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => searchSessionsTable.id),
  stageId: text("stage_id").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkflowStageSchema = createInsertSchema(workflowStagesTable).omit({ id: true, createdAt: true });
export type InsertWorkflowStage = z.infer<typeof insertWorkflowStageSchema>;
export type WorkflowStage = typeof workflowStagesTable.$inferSelect;
