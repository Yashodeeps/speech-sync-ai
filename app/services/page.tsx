"use client";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const router = useRouter();
  return (
    <div className="flex  items-center mt-40 flex-col space-y-3 ">
      <h1 className="text-4xl text-zinc-800 font-semibold">
        {" "}
        Services we provide{" "}
      </h1>
      <div className="flex gap-6 cursor-pointer py-4">
        <ServiceCard
          name="Communication Mentor"
          description="Practice and improve your communication skills,"
          onClick={() => router.push("/talk")}
        />
        <ServiceCard
          name="Voice Therapist"
          description="Improve your mental health, anything and everything and get personolized guidance."
          onClick={() => router.push("/services/therapist")}
        />

        <ServiceCard
          name="Expression Measurement"
          description="Measure your facial expressions"
          onClick={() => router.push("/services/expression")}
        />
      </div>
    </div>
  );
};

export default page;
