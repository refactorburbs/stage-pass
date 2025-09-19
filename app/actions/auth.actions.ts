"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthFormState } from "@/lib/types/forms.types";
import { createSession, deleteSession } from "@/lib/sessions";
import { createFullName, createInitials } from "@/lib/utils";

// Validation schemas ----------------------------------------------------------------
const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  confirmPassword: z.string(),
  inviteCode: z.string().min(1, "Invite Code is required. Contact your administrator."),
  avatar: z.number().default(0),
  customAvatarUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
// -----------------------------------------------------------------------------------

export async function signup(state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  // 1. Validate form fields with zod
  const validatedFields = signupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    inviteCode: formData.get("inviteCode"),
    avatar: Number(formData.get("avatar")),
    customAvatarUrl: formData.get("customAvatarUrl") || "",
  })

  if (!validatedFields.success) {
    const tree = z.treeifyError(validatedFields.error);
    const fieldErrors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(tree.properties ?? {})) {
      if (value?.errors?.length > 0) {
        fieldErrors[key] = value.errors;
      }
    }
    return { errors: fieldErrors };
  }

  const { firstName, lastName, email, password, avatar, customAvatarUrl, inviteCode } = validatedFields.data;
  try {
    // 2. Check if the invite code exists in our database
    const inviteCodeRecord = await prisma.inviteCode.findUnique({
      where: {
        code: inviteCode
      },
      select: {
        id: true,
        team_id: true,
        role: true,
        ownedGameIds: true
      }
    });
    // Invite codes are used to pre-populate user roles and team/game associations
    if (!inviteCodeRecord) {
      return {
        errors: {
          inviteCode: ["Invalid Invite Code"]
        }
      }
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return {
        errors: {
          email: ["An account with this email already exists"]
        }
      }
    }

    // 4. Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        fullName: createFullName(firstName, lastName),
        initials: createInitials(firstName, lastName),
        email: email.toLowerCase(), // normalizing this so that different case emails aren't separate users
        passwordHash: hashedPassword,
        avatar,
        customAvatar: customAvatarUrl,
        role: inviteCodeRecord.role,
        isActive: true,
        lastLogin: new Date(),
        team_id: inviteCodeRecord.team_id,
        invite_code_id: inviteCodeRecord.id,
      }
    });

    // 5. If the user has final say over any games, create that relationship
    if (inviteCodeRecord.ownedGameIds) {
      for (const gameId of inviteCodeRecord.ownedGameIds) {
        await prisma.gameOwner.create({
          data: {
            game_id: gameId,
            user_id: user.id
          }
        });
      }
    }

    // 6. Create a session for this newly created user
    await createSession(user.id);

  } catch (error) {
    console.error("Signup error:", error)
    return {
      message: "Something went wrong. Please try again."
    }
  }

  // 7. Redirect to the main dashboard page.
  redirect("/");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    const tree = z.treeifyError(validatedFields.error);
    const fieldErrors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(tree.properties ?? {})) {
      if (value?.errors?.length) {
        fieldErrors[key] = value.errors;
      }
    }
    return { errors: fieldErrors };
  }

  const { email, password } = validatedFields.data

  try {
    // Query the database for the user with the given email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        message: "Invalid email or password."
      }
    }

    // Compare the user's password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return {
        message: "Invalid email or password."
      }
    }

    // Make sure this user is still active with us in the system (could be archived user)
    if (!user.isActive) {
      return {
        message: "This account has been deactivated. Please contact your administrator."
      }
    }

    // If login successful, create a session for the user and redirect
    await createSession(user.id);
    // Update the user's last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

  } catch (error) {
    console.error("Login error:", error)
    return {
      message: "Something went wrong. Please try again."
    }
  }

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/auth/login");
}