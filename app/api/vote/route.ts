import { NextRequest, NextResponse } from "next/server";
import { VotePhase, VoteType } from "../../generated/prisma";
import { castAssetVote } from "../../actions/asset.actions";

/*
Leaving this here just in case - the pending asset card carousel can crash if you
move too quickly through the ui (navigate away from the page immediately after voting).
This is because the useTransition and useOptimistic hooks open up a streaming protocol
that remains open until the asynchronous call finishes. If you navigate away while the stream
is still open, you can get errors like "chunk.reason.enqueueModel is not a function"
However api routes like this don't really work optimistically so far... need to think on this edge case.
*/
export async function POST(request: NextRequest) {
  try {
    const { assetId, gameId, voteType, phase } = await request.json();

    await castAssetVote(
      Number(assetId),
      Number(gameId),
      voteType as VoteType,
      phase as VotePhase
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vote API error:", error);
    return NextResponse.json(
      { success: false, error: "Vote failed" },
      { status: 500 }
    );
  }
}