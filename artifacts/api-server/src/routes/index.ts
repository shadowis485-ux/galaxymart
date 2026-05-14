import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import reviewsRouter from "./reviews";
import stockRouter from "./stock";
import ltcRouter from "./ltc";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth",       authRouter);
router.use("/products",   productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders",     ordersRouter);
router.use("/payments",   paymentsRouter);
router.use("/reviews",    reviewsRouter);
router.use("/stock",      stockRouter);
router.use("/ltc",        ltcRouter);
router.use("/settings",   settingsRouter);

export default router;
