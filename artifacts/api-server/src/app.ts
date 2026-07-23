import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { seedDatabase } from "./lib/seed";
import { runMigrations } from "@workspace/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({
  limit: "100mb",
  reviver: (_key, value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  },
}));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use("/api", router);

if (process.env["NODE_ENV"] === "production") {
  const staticDir = path.join(__dirname, "public");
  app.use(express.static(staticDir));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

// In dev: __dirname = .../artifacts/api-server/src  → ../../.. goes to workspace root
// In Docker bundle: __dirname = .../artifacts/api-server/dist → ./drizzle is copied there by Dockerfile
const migrationsFolder = process.env["NODE_ENV"] === "production"
  ? path.resolve(__dirname, "./drizzle")
  : path.resolve(__dirname, "../../../lib/db/drizzle");

// Kubernetes-safe startup: Postgres may not be ready when this pod starts
// (no depends_on ordering like Docker Compose). Retry migrations with
// backoff; if the DB never becomes ready, exit so the orchestrator restarts us
// instead of serving a broken app with no tables.
const MIGRATION_MAX_ATTEMPTS = 30;
const MIGRATION_RETRY_DELAY_MS = 2000;

export async function initDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= MIGRATION_MAX_ATTEMPTS; attempt++) {
    try {
      await runMigrations(migrationsFolder);
      logger.info("Database migrations applied");
      await seedDatabase();
      logger.info("Database seeded");
      return;
    } catch (err) {
      if (attempt === MIGRATION_MAX_ATTEMPTS) {
        logger.error(
          { err, attempt },
          "Startup DB error: giving up after final attempt, exiting",
        );
        process.exit(1);
      }
      logger.warn(
        { err, attempt, retryInMs: MIGRATION_RETRY_DELAY_MS },
        "Startup DB not ready yet, retrying",
      );
      await new Promise((resolve) =>
        setTimeout(resolve, MIGRATION_RETRY_DELAY_MS),
      );
    }
  }
}

export default app;
