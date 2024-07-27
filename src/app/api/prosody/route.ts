import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextRequest) {
  const { mediaUrl }: any = await req.json();

  try {
    console.log("Analyzing media:", mediaUrl);
    const response = await axios.post(
      "https://api.hume.ai/v0/batch/jobs",
      {
        urls: [mediaUrl],
        models: ["prosody"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Hume-Api-Key": `${process.env.NEXT_PUBLIC_HUME_API_KEY}`,
        },
      }
    );

    console.log(response);

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze media" });
  }
}
