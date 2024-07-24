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
    <div className="grid grid-cols-2">
      <HumeWebSocket />
      <div className="grow flex flex-col">
        <Chat accessToken={accessToken} />
      </div>
    </div>
  );
}
