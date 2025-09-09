"use server";

import { pinata } from "@/pinata/config";

export async function uploadFileToPinata(file: File): Promise<string> {
  try {
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    return url;
  } catch (error) {
    console.error(`Pinata failed to upload file: ${error}`);
    throw new Error("Failed to upload file to Pinata");
  }
}