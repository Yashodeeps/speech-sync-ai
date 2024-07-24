"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useMyContext } from "@/src/utils/context";

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const [stateValue, setStateValue] = useState();

  const { state } = useMyContext();

  useEffect(() => {
    setStateValue(state);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("State value every second:", JSON.stringify(stateValue));
    }, 1000);

    return () => clearInterval(interval);
  }, [stateValue]);

  console.log("State value:", stateValue);

  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId="e04a5edc-817e-41fd-b6dc-11e85ebe38de"
        sessionSettings={{
          context: {
            text: `use theis context data of realtime emotions to judge the users communication skills: ${JSON.stringify(
              stateValue
            )}`,
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
