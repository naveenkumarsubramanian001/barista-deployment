import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import tipsRouter from "./tips.js";
import searchRouter from "./search.js";
import articlesRouter from "./articles.js";
import pdfRouter from "./pdf.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tipsRouter);
router.use(searchRouter);
router.use(articlesRouter);
router.use(pdfRouter);

export default router;
