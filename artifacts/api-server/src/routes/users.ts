import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    role: usersTable.role,
    mustChangePassword: usersTable.mustChangePassword,
    createdAt: usersTable.createdAt,
  }).from(usersTable);
  res.json(users);
});

router.post("/users", requireAuth, requireAdmin, async (req, res) => {
  const { username, email, role, password } = req.body as { username: string; email?: string; role?: string; password?: string };
  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Le mot de passe doit comporter au moins 6 caractères" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(usersTable).values({
    username,
    email: email ?? null,
    passwordHash,
    role: role ?? "user",
    mustChangePassword: true,
  }).returning({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    role: usersTable.role,
    mustChangePassword: usersTable.mustChangePassword,
    createdAt: usersTable.createdAt,
  });

  res.status(201).json(user);
});

router.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  const { username, email, role } = req.body as { username?: string; email?: string; role?: string };

  const [updated] = await db.update(usersTable)
    .set({ ...(username && { username }), ...(email !== undefined && { email }), ...(role && { role }) })
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      role: usersTable.role,
      mustChangePassword: usersTable.mustChangePassword,
    });

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(updated);
});

router.post("/users/:id/reset-password", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  const { password } = req.body as { password?: string };
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Le mot de passe doit comporter au moins 6 caractères" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [updated] = await db.update(usersTable)
    .set({ passwordHash, mustChangePassword: true })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id, username: usersTable.username });
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ message: "Password reset", username: updated.username });
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
