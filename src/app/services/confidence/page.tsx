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
        contextText="Teach user to be a confident speaker, incorporate various speaking techniques, and provide feedback"
      />
    </div>
  );
}
