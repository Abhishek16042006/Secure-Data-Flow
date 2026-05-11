import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import messagesRouter from "./messages";
import messageRequestsRouter from "./message-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(messageRequestsRouter);
router.use(messagesRouter);

export default router;
