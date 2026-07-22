import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import cyberscoreRouter from "./cyberscore";
import devicesRouter from "./devices";
import alertsRouter from "./alerts";
import darktraceRouter from "./darktrace";
import penteraRouter from "./pentera";
import trainingRouter from "./training";
import assistantRouter from "./assistant";
import notificationsRouter from "./notifications";

import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);

// Apply auth middleware to all other routes
router.use(requireAuth);

router.use(usersRouter);
router.use(cyberscoreRouter);
router.use(devicesRouter);
router.use(alertsRouter);
router.use(darktraceRouter);
router.use(penteraRouter);
router.use(trainingRouter);
router.use(assistantRouter);
router.use(notificationsRouter);

export default router;
