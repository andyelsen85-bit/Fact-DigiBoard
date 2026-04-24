import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const SESSION_DAYS = 30;

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

  res.json({
    token,
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.json({ message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });
});

router.post("/auth/change-password", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { newPassword } = req.body as { newPassword: string };
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "Password changed" });
});

export default router;
