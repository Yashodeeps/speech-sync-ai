"use client";
import { Button } from "@/src/components/ui/moving-border";
import { useRouter } from "next/navigation";
import React from "react";
import { FlipWords } from "@/src/components/ui/flip-words";

const page = () => {
  const router = useRouter();
  const words = ["to Speak", "to be Confident", "Debate", "to Express"];

  return (
    // <div className="flex justify-center items-center mt-60 flex-col space-y-3">
    //   <h1 className="text-5xl font-semibold"> Welcome to Speech Sync</h1>
    //   <p className="">
    //     - We leverage and empower the empathatic voice and expression
    //     measurement models to build tools that matters -{" "}
    //   </p>
    //   <Button onClick={() => router.push("/services")}>Try Services</Button>
    // </div>

    <div className="h-[40rem] flex justify-center items-center px-4">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
          Learn
          <FlipWords words={words} /> <br />
          With our advanced AI tools
        </div>
        <Button
          borderRadius="1.75rem"
          className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
          onClick={() => router.push("/services")}
        >
          Try now{" "}
        </Button>
      </div>
    </div>
  );
};

export default page;
