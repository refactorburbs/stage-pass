/* Edge-compatible code that can be used in middleware (which runs on the edge by default).
To access cookies, use the NextRequest object. Other server components can use cookies() from next/headers
and client components can use client-safe API fetch or other route handlers.
*/

import { jwtVerify, SignJWT } from "jose";
import { SessionPayload } from "../types/auth.types";
import { NextRequest, NextResponse } from "next/server";

// Jose is edge runtime compatible, used for JWT encryption/decryption
// Encrypted stateless sessions are stored in HTTP only cookies
// 4 hour expiration with security flags.

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not set");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("4h")
    .sign(encodedKey)
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    if (!session) {
      return null
    }
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as SessionPayload
  } catch (error) {
    console.error("Failed to verify session", error);
    return null;
  }
}

/**
 * Refresh the session inside middleware (Edge-compatible).
 * Takes the request and response, refreshes the cookie, and returns the updated response.
*/
export async function updateSessionEdge(req: NextRequest, res?: NextResponse): Promise<NextResponse> {
  const cookie = req.cookies.get("session")?.value;
  const payload = await decrypt(cookie);

  if (!cookie || !payload) return res ?? NextResponse.next();

  const expires = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hour expiration
  const newSession = await encrypt({
    userId: payload.userId,
    expiresAt: expires
  });

  // Use existing response or create a new one
  const response = res ?? NextResponse.next();

  response.cookies.set("session", newSession, {
    httpOnly: true, // Prevents JS access
    expires,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // Cookies only sent over https (won't work in dev with http://localhost)
    path: "/" // set the cookie to all paths starting with "/" (make session available site-wide)
  });

  return response;
}