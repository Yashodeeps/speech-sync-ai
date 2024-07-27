"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useMyContext } from "@/src/utils/context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { CircleArrowRight } from "lucide-react";
import { Separator } from "@/src/components/ui/separator";

interface Emotion {
  name: string;
  score: number;
}

interface Prediction {
  text: string;
  position: { begin: number; end: number };
  emotions: Emotion[];
}

interface Message {
  language: {
    predictions: Prediction[];
  };
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false); // Track streaming status
  const [topEmotions, setTopEmotions] = useState<Emotion[]>([]); // State for top emotions
  const [error, setError] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Track the video stream

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (isStreaming) {
      startStream().catch((err) => {
        setError("Failed to start recording: " + err.message);
        setIsStreaming(false);
      });
    } else {
      stopStream();
    }
  }, [isStreaming]);

  console.log("isStreaming", isStreaming);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream; // Save stream reference
        console.log("Video stream assigned:", stream);

        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current?.play().catch((error) => {
            console.error("Error playing video:", error);
          });
        };
      }

      mediaRecorderRef.current = new MediaRecorder(stream);

      const chunks: BlobPart[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
        setRecordedChunks((chunks) => [...chunks, event.data]);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedVideo(URL.createObjectURL(blob));
        console.log("recordedChunks", URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();

      socketRef.current = new WebSocket(
        `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
        // const jsonMessage = {
        //   models: {
        //     language: {},
        //     prosody: {},
        //     face: {},
        //   },
        //   data: "Mary had a little lamb",
        // };

        // if (socketRef.current) {
        //   socketRef.current.send(JSON.stringify(jsonMessage));
        // }
      };

      socketRef.current.onmessage = (event) => {
        const response: Message = JSON.parse(event.data);
        console.log("Received message:", response);
        setMessages((prevMessages) => [...prevMessages, response]);
        const getTopEmotions = (): Emotion[] => {
          const emotionMap: Record<string, number> = {};
          response.language?.predictions.forEach((pred) => {
            pred.emotions.forEach((emotion) => {
              if (
                !emotionMap[emotion.name] ||
                emotion.score > emotionMap[emotion.name]
              ) {
                emotionMap[emotion.name] = emotion.score;
              }
            });
          });

          const allEmotions = Object.entries(emotionMap).map(
            ([name, score]) => ({
              name,
              score,
            })
          );

          return allEmotions.sort((a, b) => b.score - a.score).slice(0, 3);
        };

        const topEmotions = getTopEmotions();

        setTopEmotions(topEmotions);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Failed to connect to WebSocket: " + error);
        setIsStreaming(false);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
      };

      setIsStreaming(true);
    } catch (error) {
      console.error("Error starting stream: ", error);
    }
  };

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null; // Clear the stream reference

    socketRef.current?.close();
    socketRef.current = null; // Clear WebSocket reference
    setIsStreaming(false);
  };

  const captureFrame = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        const width = 320;
        const height = 240;
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        context.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.5); // Reduce quality to 50%
        const base64Data = dataUrl.split(",")[1];

        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          const message = JSON.stringify({
            models: {
              language: {},
            },
            raw_text: true,
            data: base64Data,
          });
          socketRef.current.send(message);
        }
      }
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isStreaming) {
      intervalId = setInterval(captureFrame, 500); // Capture frame every second
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isStreaming]);

  console.log("Messages:", messages);

  console.log("Top emotions:", topEmotions);

  return (
    <>
      <div className="p-4 flex w-full gap-5">
        <div className=" p-4 w-1/2">
          {" "}
          <h1 className="text-2xl font-semibold">
            Your Personalized Speaking Coach
          </h1>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <div className="flex">
            {" "}
            <ol className="relative border-s border-gray-200 dark:border-gray-700 my-4">
              <li className="mb-10 ms-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setIsStreaming(true)}
                    >
                      {isStreaming ? "Stop Stream" : "Record Stream"}{" "}
                      <CircleArrowRight
                        strokeWidth={1}
                        size={16}
                        className="ml-2"
                      />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Record</DialogTitle>
                    </DialogHeader>
                    <div>
                      <video ref={videoRef} autoPlay muted />
                      <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsStreaming(false)}
                        >
                          {isStreaming ? "Stop Stream" : "Start Stream"}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </li>
              <li className="mb-10 ms-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <Button variant="outline">
                  Analyse{" "}
                  {
                    <CircleArrowRight
                      strokeWidth={1}
                      size={16}
                      className="ml-2"
                    />
                  }{" "}
                </Button>
              </li>
              <li className="ms-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <Button variant="outline">All done</Button>
              </li>
            </ol>{" "}
            <div>
              {" "}
              {recordedVideo && (
                <div className="p-4">
                  <video
                    className="rounded-lg w-full"
                    src={recordedVideo}
                    controls
                  />
                  <Button variant="default">Analyze Recording</Button>
                </div>
              )}
            </div>
          </div>
          {/* {analysis && (
          <div>
            <h2>Analysis Complete</h2>
            <p>You can now start a conversation about your performance.</p>
            <button onClick={isListening ? stopListening : startListening}>
              {isListening ? "Stop Conversation" : "Start Conversation"}
            </button>
          </div>
        )} */}
        </div>

        <Separator orientation="vertical" className="h-screen" />
        <div className="w-1/2">
          <h2>Feedback:</h2>
          {/* <p>{feedback || ""}</p> */}
        </div>
      </div>
      {/* <div className=" flex  mx-4  gap-4  my-11 w-full ">
        <div>
          <video
            className="rounded-xl shadow-lg "
            ref={videoRef}
            muted
            playsInline
            autoPlay
            style={{ width: "100%", height: "auto", border: "1px solid black" }} // Adjust size and border
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <div className="flex flex-col justify-center items-center w-full bg-slate-100 my-2 rounded-md">
          <ul className="mx-4 text-end">
            {topEmotions.map((emotion, index) => (
              <li key={index} className="">
                {emotion.name}: {Math.round(emotion.score * 100)}%
              </li>
            ))}
          </ul>
          <div className="pb-5">
            <Button
              className="my-4"
              onClick={isStreaming ? stopStream : startStream}
            >
              {isStreaming ? "Stop video" : "Start video"}
            </Button>
          </div>
        </div>
      </div> */}
    </>
  );
}
