/* Anything that uses cookies or "server-only" must be imported in server files
from the "/app" router (e.g. server actions, API routes, layouts, or other server utilities).
This is different from middleware, which is NOT a server component - it's its own special edge runtime.
Thus anything that uses cookies() from next/headers is not available in middleware - middleware has
access to cookies through the NextRequest object.
*/
import "server-only";

import { cookies } from "next/headers";
import { decrypt, encrypt } from "./sessions.edge";

export async function createSession(userId: number) {
  // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
  const stringId = JSON.stringify(userId);
  const session = await encrypt({ userId: stringId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true, // Prevents JS access
    expires: expiresAt,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // Cookies only sent over https (won't work in dev)
    path: "/", // set the cookie to all paths starting with "/" (make session available site-wide)
  });
}

export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) {
    return { userId: null };
  }

  return { userId: session.userId };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}