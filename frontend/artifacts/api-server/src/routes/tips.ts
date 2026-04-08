import { Router, type IRouter } from "express";
import { GetTipsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tips", (_req, res) => {
  const data = GetTipsResponse.parse({
    tips: [
      { id: "1", text: "What were the latest product releases from OpenAI?", category: "company" },
      { id: "2", text: "Latest official updates from NVIDIA", category: "company" },
      { id: "3", text: "General trends in vector databases", category: "domain" },
      { id: "4", text: "Recent developments in enterprise AI agents", category: "domain" },
      { id: "5", text: "What is happening in the solar energy sector?", category: "domain" },
      { id: "6", text: "Apple Vision Pro ecosystem updates", category: "product" },
      { id: "7", text: "Anthropic Claude latest capabilities", category: "product" },
      { id: "8", text: "Tesla Autopilot regulatory news", category: "product" },
      { id: "9", text: "Microsoft Copilot enterprise adoption trends", category: "product" },
      { id: "10", text: "Recent breakthroughs in quantum computing", category: "domain" },
    ],
  });
  res.json(data);
});

export default router;
