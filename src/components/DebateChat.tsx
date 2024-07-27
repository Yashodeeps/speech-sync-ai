"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useMyContext } from "@/src/utils/context";

export default function DialogChat({
  accessToken,
  contextText,
}: {
  accessToken: string;
  contextText: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId="8aeb8cf3-1573-43f6-b03f-7140e083c0c8"
        sessionSettings={{
          context: {
            text: contextText,
            type: "persistent",
          },
        }}
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}
