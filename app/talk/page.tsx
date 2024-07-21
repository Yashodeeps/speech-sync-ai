import HumeWebSocket from "@/components/HumeWebsocket";
import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import { HumeClient } from "hume";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/Chat"), {
  ssr: false,
});

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className="grid grid-cols-2">
      <HumeWebSocket />
      <div className="grow flex flex-col">
        <Chat accessToken={accessToken} />
      </div>
    </div>
  );
}
