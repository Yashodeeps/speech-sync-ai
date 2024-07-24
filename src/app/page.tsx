"use client";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center mt-60 flex-col space-y-3">
      <h1 className="text-5xl font-semibold"> Welcome to Speech Sync</h1>
      <p className="">
        - We leverage and empower the empathatic voice and expression
        measurement models to build tools that matters -{" "}
      </p>
      <Button onClick={() => router.push("/services")}>Try Services</Button>
    </div>
  );
};

export default page;
