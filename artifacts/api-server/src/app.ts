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
runMigrations(migrationsFolder)
  .then(() => logger.info("Database migrations applied"))
  .then(() => seedDatabase())
  .catch((err) => logger.error({ err }, "Startup DB error"));

export default app;
