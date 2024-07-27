import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  //   const { videoBlob, audioBlob }: any = req.json();
  const { recordedVideo } = await req.json();

  try {
    console.log("Analyzing media:", recordedVideo);
    const response = await axios.post(
      "https://api.hume.ai/v0/batch/jobs",
      {
        models: {
          face: {},
        },
        urls: ["https://hume-tutorials.s3.amazonaws.com/faces.zip"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Hume-Api-Key": `${process.env.NEXT_PUBLIC_HUME_API_KEY}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze media" });
  }
  // Process video for facial expressions
  //   const facialResults = await humeAI.analyzeFacialExpressions(videoBlob);

  //   // Process audio for prosody
  //   const prosodyResults = await humeAI.analyzeProsody(audioBlob);

  //   // Transcribe audio
  //   const transcription = await speechToText(audioBlob);

  //   // Analyze content
  //   const contentResults = await humeAI.analyzeEmpathicVoice(transcription);

  //   // Combine results
  //   const combinedResults = combineAnalysis(
  //     facialResults,
  //     prosodyResults,
  //     contentResults
  //   );

  //   // Generate feedback
  //   const feedback = generateFeedback(combinedResults);

  //   res.status(200).json({ feedback });
}
