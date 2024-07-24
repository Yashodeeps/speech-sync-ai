import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { mediaUrl } = req.body;

  try {
    const response = await axios.post(
      "https://api.hume.ai/v0/batch",
      {
        urls: [mediaUrl],
        models: ["prosody"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUME_API_KEY}`,
        },
      }
    );
    console.log(response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze media" });
  }
}
