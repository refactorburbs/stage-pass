"use server";

import { UploadAssetFormState } from "@/lib/types/forms.types";
import { z } from "zod";
import { uploadFileToPinata } from "./pinata.actions";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/sessions";

// Validation schemas ----------------------------------------------------------------
const uploadAssetSchema = z.object({
  screenshot: z.instanceof(File)
    .refine((file) => file.size <= 25 * 1024 * 1024, { // 25MB limit
      message: "File size must be less than 25MB. Please compress your image or choose a smaller file."
    }),
  title: z.string().min(5, "Title should be more descriptive."),
  category: z.string(),
  gameId: z.string().transform((id) => { // Form fields are strings, so transform to num.
    const num = parseInt(id);
    if (isNaN(num)) throw new Error("Invalid game ID");
    return num;
  })
}).refine((data) => [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/gif"
].includes(data.screenshot.type), {
  message: "Invalid image file type",
  path: ["screenshot"]
});
// -----------------------------------------------------------------------------------

export async function uploadAssetImage(_state: UploadAssetFormState, formData: FormData): Promise<UploadAssetFormState> {
  // 1. Validate upload form fields with zod
  const validatedFields = uploadAssetSchema.safeParse({
    screenshot: formData.get("screenshot"),
    title: formData.get("title"),
    category: formData.get("category"),
    gameId: formData.get("gameId")
  });

  if (!validatedFields.success) {
    console.log('validation was not a success')
    const tree = z.treeifyError(validatedFields.error);
    const fieldErrors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(tree.properties ?? {})) {
      if (value?.errors?.length > 0) {
        fieldErrors[key] = value.errors;
      }
    }
    return { errors: fieldErrors };
  }

  console.log('form fields were verified!', validatedFields.data)

  const { screenshot, title, category, gameId } = validatedFields.data;
  // 2. Get user id (uploader_id) from the session store
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session");
    return { message: "Something went wrong. Invalid user session id." }
  }
  const uploaderId = session.userId;

  try {
    // 3. Convert the image blob into a url
    const imageUrl = await uploadFileToPinata(screenshot);
    // 4. Create a new asset in Prisma
    console.log("uploaded to pinata: ", imageUrl, title, category, gameId, uploaderId);
  } catch (error) {
    console.error("Image upload error:", error)
    return {
      message: `Image upload error: ${error}`
    }
  }
  // Redirect to the user's feed (should see their post in pending)
  // redirect(`/game/${gameId}`);
}