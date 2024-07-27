"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { CircleArrowRight, Play, Pause } from "lucide-react";
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
  prosody: {
    predictions: Prediction[];
  };
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [topEmotions, setTopEmotions] = useState<Emotion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording().catch((err) => {
        setError("Failed to start recording: " + err.message);
        setIsRecording(false);
      });
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleRecordingStop;
      mediaRecorderRef.current.start(4000); // Collect data every 4 seconds

      socketRef.current = new WebSocket(
        `wss://api.hume.ai/v0/stream/models?api_key=${process.env.NEXT_PUBLIC_HUME_API_KEY}`
      );

      socketRef.current.onopen = () =>
        console.log("WebSocket connection established");
      socketRef.current.onmessage = handleWebSocketMessage;
      socketRef.current.onerror = handleWebSocketError;
      socketRef.current.onclose = (event) =>
        console.log("WebSocket connection closed:", event);

      setIsRecording(true);
      setAudioURL(null); // Reset audio URL when starting a new recording
    } catch (error) {
      console.error("Error starting recording: ", error);
      setError("Failed to start recording: " + (error as Error).message);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsRecording(false);
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
      sendChunkToWebSocket(event.data);
    }
  };

  const handleRecordingStop = () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
    chunksRef.current = [];
  };

  const sendChunkToWebSocket = (chunk: Blob) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const reader = new FileReader();

      reader.onloadend = () => {
        try {
          const base64data = reader.result as string;
          const base64Content = base64data.split(",")[1];
          const jsonMessage = {
            models: { prosody: {} },
            data: base64Content,
          };

          socketRef.current?.send(JSON.stringify(jsonMessage));
        } catch (error) {
          console.error("Error processing or sending data:", error);
        }
      };

      reader.onerror = (error) => console.error("Error reading file:", error);
      reader.readAsDataURL(chunk);
    }
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const response: Message = JSON.parse(event.data);
      console.log("Received message:", response);
      setMessages((prevMessages) => [...prevMessages, response]);
      setTopEmotions(getTopEmotions(response));
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  };

  const handleWebSocketError = (error: Event) => {
    console.error("WebSocket error:", error);
    setError("Failed to connect to WebSocket: " + error);
    setIsRecording(false);
  };

  const getTopEmotions = (response: Message): Emotion[] => {
    const emotionMap: Record<string, number> = {};
    response.prosody?.predictions.forEach((pred) => {
      pred.emotions.forEach((emotion) => {
        if (
          !emotionMap[emotion.name] ||
          emotion.score > emotionMap[emotion.name]
        ) {
          emotionMap[emotion.name] = emotion.score;
        }
      });
    });

    return Object.entries(emotionMap)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  console.log("messages", messages);

  return (
    <div className="p-4 flex w-full gap-5">
      <div className="p-4 w-1/2">
        <h1 className="text-2xl font-semibold">
          Your Personalized Speaking Coach
        </h1>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="flex">
          <ol className="relative border-s border-gray-200 dark:border-gray-700 my-4">
            <li className="mb-10 ms-4">
              <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
              <Button
                variant="outline"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
                <CircleArrowRight strokeWidth={1} size={16} className="ml-2" />
              </Button>
            </li>
            <li className="mb-10 ms-4">
              <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
              <Button variant="outline">
                Analyse
                <CircleArrowRight strokeWidth={1} size={16} className="ml-2" />
              </Button>
            </li>
            <li className="ms-4">
              <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
              <Button variant="outline">All done</Button>
            </li>
          </ol>
        </div>
        {audioURL && (
          <div className="mt-4">
            <audio ref={audioRef} src={audioURL} />
            <Button onClick={togglePlayback}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "Pause" : "Play"} Recording
            </Button>
          </div>
        )}
      </div>

      <Separator orientation="vertical" className="h-screen" />
      <div className="w-1/2">
        <h2>Feedback:</h2>
        {topEmotions.map((emotion, index) => (
          <div key={index}>
            {emotion.name}: {emotion.score.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
