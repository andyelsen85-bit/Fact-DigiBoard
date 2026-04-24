import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import patientsRouter from "./patients";
import notesRouter from "./notes";
import historyRouter from "./history";
import statsRouter from "./stats";
import actRouter from "./act";
import settingsRouter from "./settings";
import icd10Router from "./icd10";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(patientsRouter);
router.use(notesRouter);
router.use(historyRouter);
router.use(statsRouter);
router.use(actRouter);
router.use(settingsRouter);
router.use(icd10Router);

export default router;
