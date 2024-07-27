// "use client";

// import { PlaceholdersAndVanishInput } from "@/src/components/ui/placeholders-and-vanish-input";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { set } from "remeda";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/src/components/ui/dialog";
// import { Button } from "@/src/components/ui/button";
// import { Label } from "@/src/components/ui/label";
// import { Input } from "@/src/components/ui/input";
// import DialogChat from "@/src/components/DebateChat";
// import DebateWrapper from "@/src/components/Debate";

// export default function Debate({ accessToken }: { accessToken: string }) {
//   const [searchText, setSearchText] = useState("");

//   const [placeholders, setPlaceholders] = useState<string[]>([
//     "Debate on AI boom",
//     "Debate on digital security",
//     "Debate on privacy on social media",
//   ]);
//   const [debateTopics, setDebateTopics] = useState<string[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     console.log(e.target.value);
//     setSearchText(e.target.value);
//   };

//   const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
//     e.preventDefault();
//     console.log("submitted");
//     setIsDialogOpen(true);
//   };

//   useEffect(() => {
//     async function fetchTopics(): Promise<void> {
//       try {
//         const response = await axios.get("/api/debate");
//         // if (response.data.topics && response.data.topics.length > 0) {
//         //   setDebateTopics(response.data);
//         //   setPlaceholders(response.data);
//         // }

//         console.log(response.data);
//       } catch (error) {
//         if (axios.isAxiosError(error)) {
//           console.error("Axios error:", error.response?.data);
//         } else {
//           console.error("Error fetching topics:", error);
//         }
//       }
//     }
//     fetchTopics();
//   }, []);

//   return (
//     <div className="h-[40rem] flex flex-col justify-center items-center px-4">
//       <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
//         Enter a debate topic
//       </h2>
//       <PlaceholdersAndVanishInput
//         placeholders={placeholders}
//         onChange={handleChange}
//         onSubmit={onSubmit}
//       />

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Debate</DialogTitle>
//           </DialogHeader>
//           <DebateWrapper contextText={searchText} />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import DialogChat from "@/src/components/DebateChat";
import HumeWebSocket from "@/src/components/HumeWebsocket";
import { getHumeAccessToken } from "@/src/utils/getHumeAccessToken";
import { HumeClient } from "hume";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/src/components/Chat"), {
  ssr: false,
});

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className="grow flex flex-col">
      <DialogChat
        accessToken={accessToken}
        contextText="Ask user to choose topic and side for the debate and debate on it"
      />
    </div>
  );
}
