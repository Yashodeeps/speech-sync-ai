import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY, // Use server-side environment variable
});

export async function GET(req: NextRequest, res: NextResponse) {
  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.WORQHAT_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question:
        "Suggest 3 debating topics for users who are learning to communicate confidently. The topics should be suitable for debate with Hume AI's empathetic voice model. response should be an array and only array no other data",
      randomness: 0.5,
      response_type: "json",
    }),
  };
  try {
    const response = await axios.post(
      "https://api.worqhat.com/api/ai/content/v2",
      options.body,
      { headers: options.headers }
    );

    return NextResponse.json({ topics: response });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch debate topics" });
  }
}
