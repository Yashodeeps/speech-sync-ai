"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useMyContext } from "@/src/utils/context";
import { Separator } from "./ui/separator";

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

const HumeWebSocket: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false); // Track streaming status
  const [topEmotions, setTopEmotions] = useState<Emotion[]>([]); // State for top emotions

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Track the video stream

  const { state, setState, isActive, setIsActive } = useMyContext();

  useEffect(() => {
    console.log("isActive", isActive);
    if (isActive === true) {
      setIsStreaming(true);
      startStream();
    } else {
      stopStream();
    }
  }, [isActive]);

  console.log("isStreaming", isStreaming);

  useEffect(() => {
    if (!isActive) {
      stopStream();
    }
  }, [isActive]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

      socketRef.current = new WebSocket(
        `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
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

        setTopEmotions(getTopEmotions());
        setState(getTopEmotions());
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
      };

      setIsStreaming(true);
      setIsActive(true);
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

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null; // Clear the stream reference

    socketRef.current?.close();
    socketRef.current = null; // Clear WebSocket reference
    setIsStreaming(false);
    setIsActive(false);
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

    if (isStreaming || isActive) {
      intervalId = setInterval(captureFrame, 500); // Capture frame every second
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isStreaming, isActive]);

  console.log("Messages:", messages);

  console.log("Top emotions:", topEmotions);

  return (
    <div className=" flex  mx-4  gap-4  my-11 w-full ">
      <div className="w-1/2">
        <video
          className="rounded-xl shadow-lg "
          ref={videoRef}
          muted
          playsInline
          autoPlay
          style={{ width: "80%", height: "auto", border: "1px solid black" }} // Adjust size and border
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      <Separator orientation="vertical" />
      <div className="flex flex-col justify-center items-center w-1/2  my-2 rounded-md ">
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
    </div>
  );
};

export default HumeWebSocket;
