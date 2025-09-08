import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "./types/auth.types";

// Jose is edge runtime compatible, used for JWT encryption/decryption
// Encrypted stateless sessions are stored in HTTP only cookies
// 7 day expiration with security flags.

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not set");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
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

export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const stringId = JSON.stringify(userId);
  const session = await encrypt({ userId: stringId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/", // set the cookie to all paths starting with "/"
  });
}

export async function updateSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  try {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newSession = await encrypt({
      userId: payload.userId,
      expiresAt: expires
    });

    cookieStore.set("session", newSession, {
      httpOnly: true,
      expires: expires,
      sameSite: "lax",
      path: "/",
    });

    return { userId: payload.userId }
  } catch (error) {
    console.log("Session update failed: ", error);
  }
  return null;
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