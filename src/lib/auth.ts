"use server";

import { cookies } from "next/headers";
import { getDatabases, appwriteConfig, ID, Query } from "./appwrite";
import type { ActionResponse } from "@/types";

// Use raw plaintext password as requested
function hashPassword(password: string): string {
  return password;
}

export interface SessionUser {
  userId: string;
  username: string;
  name: string;
  role: "admin" | "user";
}

// Login with username and password (updated for plaintext)
export async function loginUser(
  username: string,
  password: string,
): Promise<ActionResponse<SessionUser>> {
  try {
    const db = await getDatabases();
    const plaintextPassword = hashPassword(password);

    // Find user by username
    const result = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.userProfiles,
      [Query.equal("username", username)],
    );

    const user = result.documents[0];
    console.log("DEBUG LOGIN:", {
      providedUsername: username,
      providedPassword: password,
      userFound: !!user,
      dbPassword: user?.password,
      match: user?.password === plaintextPassword,
    });

    if (!user || user.password !== plaintextPassword) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    // Create session
    const sessionUser: SessionUser = {
      userId: user.$id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    const cookieStore = await cookies();
    cookieStore.set("app-session", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return {
      success: true,
      data: sessionUser,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Login failed",
    };
  }
}

// Register new user
export async function registerUser(
  username: string,
  password: string,
  name: string,
): Promise<ActionResponse<SessionUser>> {
  try {
    const db = await getDatabases();

    // Check if username exists
    const existing = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.userProfiles,
      [Query.equal("username", username)],
    );

    if (existing.documents.length > 0) {
      return {
        success: false,
        error: "Username already exists",
      };
    }

    const plaintextPassword = hashPassword(password);
    const userId = ID.unique();

    // Create user in database
    const newUser = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.userProfiles,
      userId,
      {
        username,
        password: plaintextPassword,
        name,
        role: "user",
        createdAt: new Date().toISOString(),
      },
    );

    // Create session
    const sessionUser: SessionUser = {
      userId: newUser.$id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
    };

    const cookieStore = await cookies();
    cookieStore.set("app-session", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      success: true,
      data: sessionUser,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Registration failed",
    };
  }
}

// Get current session
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app-session");

    if (!sessionCookie?.value) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch (error) {
    return null;
  }
}

// Logout
export async function logoutUser(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("app-session");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Logout failed",
    };
  }
}

// Require authentication
export async function requireAuth(): Promise<{ user: SessionUser }> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return { user: session };
}

// Require admin role
export async function requireAdmin(): Promise<{ user: SessionUser }> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { user: session };
}

// Check if admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin" || false;
}
