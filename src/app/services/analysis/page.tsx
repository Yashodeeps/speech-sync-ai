// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Dialog } from "@radix-ui/react-dialog";
// import { DialogClose, DialogTrigger } from "@/src/components/ui/dialog";
// import { Button } from "@/src/components/ui/button";
// import {
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/src/components/ui/dialog";
// import { Label } from "@/src/components/ui/label";
// import { Input } from "@/src/components/ui/input";
// import { Separator } from "@/src/components/ui/separator";
// import { ArrowBigRight, ArrowRight, CircleArrowRight } from "lucide-react";
// import { ExpressionsJob } from "@/src/components/ExpressionsJob";

// export default function Home() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
//   const [analysis, setAnalysis] = useState<any>(null);
//   const [isListening, setIsListening] = useState(false);
//   const [feedback, setFeedback] = useState();
//   const [error, setError] = useState<string | null>(null);
//   const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const audioRef = useRef(new Audio());

//   useEffect(() => {
//     if (isRecording) {
//       startRecording().catch((err) => {
//         setError("Failed to start recording: " + err.message);
//         setIsRecording(false);
//       });
//     } else if (mediaRecorderRef.current) {
//       stopRecording();
//     }
//   }, [isRecording]);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//       mediaRecorderRef.current = new MediaRecorder(stream);

//       const chunks: BlobPart[] = [];
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         chunks.push(event.data);
//         setRecordedChunks((chunks) => [...chunks, event.data]);
//       };
//       mediaRecorderRef.current.onstop = () => {
//         const blob = new Blob(chunks, { type: "video/webm" });
//         setRecordedVideo(URL.createObjectURL(blob));
//         console.log("recordedChunks", URL.createObjectURL(blob));
//       };

//       mediaRecorderRef.current.start();
//     } catch (err) {
//       console.error("Error starting recording:", err);
//       throw err;
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//     }
//     if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//   };

//   const handleAnalyze = async () => {
//     if (!recordedVideo) {
//       setError("No video recorded yet");
//       return;
//     }

//     try {
//       const response = await axios.post("/api/analysis", {
//         recordedChunks: recordedChunks,
//         recordedVideo: recordedVideo,
//       });

//       const jobId = response.data.job_id;

//       if (response.data.job_id) {
//         const emotions = await ExpressionsJob({ job_id: jobId });
//         console.log("emotions from page", emotions);
//       }
//     } catch (error) {
//       console.error("Error analyzing video:", error);
//       setError(
//         "Failed to analyze video: " +
//           (error instanceof Error ? error.message : String(error))
//       );
//     }
//   };

//   const startListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       setError("Speech recognition is not supported in this browser");
//       return;
//     }

//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = false;

//     recognitionRef.current.onresult = async (event) => {
//       const message = event.results[event.results.length - 1][0].transcript;
//       try {
//         const response = await axios.post("/api/chat", {
//           message,
//           analysisContext: analysis,
//         });
//         setFeedback(response.data.text);
//         audioRef.current.src = response.data.audioUrl;
//         audioRef.current.play();
//       } catch (error) {
//         console.error("Error sending message:", error);
//         setError(
//           "Failed to get feedback: " +
//             (error instanceof Error ? error.message : String(error))
//         );
//       }
//     };

//     recognitionRef.current.start();
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
//     setIsListening(false);
//   };

//   return (
//     <div className="p-4 flex w-full gap-5">
//       <div className=" p-4 w-1/2">
//         {" "}
//         <h1 className="text-2xl font-semibold">
//           Your Personalized Speaking Coach
//         </h1>
//         {error && <div style={{ color: "red" }}>{error}</div>}
//         <div className="flex">
//           {" "}
//           <ol className="relative border-s border-gray-200 dark:border-gray-700 my-4">
//             <li className="mb-10 ms-4">
//               <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>

//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsRecording(true)}
//                   >
//                     {isRecording ? "Stop Recording" : "Record Video"}{" "}
//                     <CircleArrowRight
//                       strokeWidth={1}
//                       size={16}
//                       className="ml-2"
//                     />
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[425px]">
//                   <DialogHeader>
//                     <DialogTitle>Record</DialogTitle>
//                   </DialogHeader>
//                   <div>
//                     <video ref={videoRef} autoPlay muted />
//                   </div>
//                   <DialogFooter>
//                     <DialogClose asChild>
//                       <Button
//                         type="button"
//                         variant="secondary"
//                         onClick={() => setIsRecording(false)}
//                       >
//                         {isRecording ? "Stop Recording" : "Start Recording"}
//                       </Button>
//                     </DialogClose>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </li>
//             <li className="mb-10 ms-4">
//               <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
//               <Button variant="outline" onClick={handleAnalyze}>
//                 Analyse{" "}
//                 {
//                   <CircleArrowRight
//                     strokeWidth={1}
//                     size={16}
//                     className="ml-2"
//                   />
//                 }{" "}
//               </Button>
//             </li>
//             <li className="ms-4">
//               <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
//               <Button variant="outline">All done</Button>
//             </li>
//           </ol>{" "}
//           <div>
//             {" "}
//             {recordedVideo && (
//               <div className="p-4">
//                 <video
//                   className="rounded-lg w-full"
//                   src={recordedVideo}
//                   controls
//                 />
//                 <Button variant="default" onClick={handleAnalyze}>
//                   Analyze Recording
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//         {analysis && (
//           <div>
//             <h2>Analysis Complete</h2>
//             <p>You can now start a conversation about your performance.</p>
//             <button onClick={isListening ? stopListening : startListening}>
//               {isListening ? "Stop Conversation" : "Start Conversation"}
//             </button>
//           </div>
//         )}
//       </div>

//       <Separator orientation="vertical" className="h-screen" />
//       <div className="w-1/2">
//         <h2>Feedback:</h2>
//         <p>{feedback}</p>
//       </div>
//     </div>
//   );
// }

export default function Home() {
  return <div>Home</div>;
}
