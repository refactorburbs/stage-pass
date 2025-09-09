"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { verifySession } from "@/lib/sessions";
import { uploadFileToPinata } from "./pinata.actions";
import { UpdateUserProfileFormState } from "@/lib/types/forms.types";

// Validation schemas ----------------------------------------------------------------
const updateUserProfileSchema = z.object({
  customAvatar: z.instanceof(File)
    .refine((file) => file.size <= 0.5 * 1024 * 1024, { // 0.5MB limit
      message: "File size must be less than 0.5MB (500KB). Please choose a smaller image."
    })
    .refine((file) => [
        "image/png",
        "image/jpeg",
        "image/jpg",
      ].includes(file.type), {
        message: "Invalid image file type"
      }
    )
});
// -----------------------------------------------------------------------------------

// Keeping this as a form action so that it is extensible if
// we want to update fields other than the profile image in the future
export async function updateUserProfile(_state: UpdateUserProfileFormState, formData: FormData): Promise<UpdateUserProfileFormState> {
  // 1. validate the file format with zod
  const validatedFields = updateUserProfileSchema.safeParse({
    customAvatar: formData.get("customAvatar")
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
  const { customAvatar } = validatedFields.data;
  // 2. Verfiy the user from session and extract their Id
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session");
    return { message: "Something went wrong. Invalid user session id." }
  }
  const userId = Number(session.userId);
  // 3. Convert the file to a url
  const customAvatarUrl = await uploadFileToPinata(customAvatar);
  // 4. Update their record for custom avatar. If in sign up, create.
  await prisma.user.update({
    where: { id: userId },
    data: { customAvatar: customAvatarUrl }
  });
  // Could either return the new, updated user or revalidate the path?
  // If we're only doing this action on the profile page, just revalidate.
  revalidatePath("/profile");
}