import { pinata } from "@/pinata/config";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const { id, cid } = await pinata.upload.public.file(file);
    const groupResponse = await pinata.groups.public.addFiles({
      groupId: process.env.PINATA_GROUP_ID as string,
      files: [ id ]
    });
    if (groupResponse[0].status !== "OK") {
      console.error("File uploaded but failed to add to group.");
    }
    const url = await pinata.gateways.public.convert(cid);
    return NextResponse.json(url, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}