import { db } from "./db";
import { adminsTable } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "editor" | "viewer";

export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: string;
};

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      email: row.email,
      password: row.passwordHash,
      name: row.name,
      role: row.role as UserRole,
      status: row.status as "active" | "inactive",
      createdAt: row.createdAt.toISOString(),
    };
  } catch (error) {
    console.warn("[auth] could not fetch user by email", error);
    return null;
  }
}

export async function findUserById(id: number): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      email: row.email,
      password: row.passwordHash,
      name: row.name,
      role: row.role as UserRole,
      status: row.status as "active" | "inactive",
      createdAt: row.createdAt.toISOString(),
    };
  } catch (error) {
    console.warn("[auth] could not fetch user by id", error);
    return null;
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function hasPermission(role: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    editor: 2,
    viewer: 1,
  };

  const userLevel = roleHierarchy[role];
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const requiredLevel = Math.max(...requiredRoles.map((r) => roleHierarchy[r]));

  return userLevel >= requiredLevel;
}