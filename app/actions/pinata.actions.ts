"use server";

import { pinata } from "@/pinata/config";

export async function uploadFileToPinata(file: File): Promise<string> {
  try {
    const { id, cid } = await pinata.upload.public.file(file);
    // Adding the file to our StagePass group for better organization
    const groupResponse = await pinata.groups.public.addFiles({
      groupId: process.env.PINATA_GROUP_ID as string,
      files: [ id ]
    });
    if (groupResponse[0].status !== "OK") {
      console.error("File uploaded but failed to add to group.");
    }
    const url = await pinata.gateways.public.convert(cid);
    return url;
  } catch (error) {
    console.error(`Pinata failed to upload file: ${error}`);
    throw new Error("Failed to upload file to Pinata");
  }
}