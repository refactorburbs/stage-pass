"use server";

import { UploadAssetFormState } from "@/lib/types/forms.types";
import { z } from "zod";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/sessions";
import prisma from "@/lib/prisma";

// Validation schemas ----------------------------------------------------------------
const uploadAssetSchema = z.object({
  imageUrl: z.string(),
  title: z.string().min(5, "Title should be more descriptive."),
  category: z.string(),
  gameId: z.string().transform((id) => { // Form fields are strings, so transform to num.
    const num = parseInt(id);
    if (isNaN(num)) throw new Error("Invalid game ID");
    return num;
  })
});
// -----------------------------------------------------------------------------------

export async function uploadAssetImage(_state: UploadAssetFormState, formData: FormData): Promise<UploadAssetFormState> {
  // 1. Validate upload form fields with zod
  const validatedFields = uploadAssetSchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    title: formData.get("title"),
    category: formData.get("category"),
    gameId: formData.get("gameId")
  });

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

  const { imageUrl, title, category, gameId } = validatedFields.data;
  // 2. Get user id (uploader_id) from the session store
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session");
    return { message: "Something went wrong. Invalid user session id." }
  }
  const uploaderId = Number(session.userId);

  try {
    // 3. Create a new asset in Prisma
    await prisma.asset.create({
      data: {
        title,
        category,
        imageUrl,
        game_id: gameId,
        uploader_id: uploaderId
      }
    });
    console.log("New asset created!");
  } catch (error) {
    console.error("Image upload error:", error)
    return {
      message: `Image upload error: ${error}`
    }
  }
  // Redirect to the user's feed (should see their post in pending)
  redirect(`/game/${gameId}`);
}