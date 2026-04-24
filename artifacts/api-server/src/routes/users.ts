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
  const { username, email, role } = req.body as { username: string; email?: string; role?: string };
  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const tempPassword = crypto.randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

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

  res.status(201).json({ ...user, tempPassword });
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

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
