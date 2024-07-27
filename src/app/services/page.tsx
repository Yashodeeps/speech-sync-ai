"use client";
import ServiceCard from "@/src/components/ServiceCard";
import { Button } from "@/src/components/ui/button";
import { HoverEffect } from "@/src/components/ui/card-hover-effect";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const router = useRouter();
  const projects = [
    {
      title: "Communication Mentor",
      description: "Practice and improve your communication skills",
      routerPath: "/talk",
    },
    {
      title: "Voice Therapist",
      description:
        "Improve your mental health, anything and everything and get personolized guidance.",
      routerPath: "/services/therapist",
    },
    {
      title: "Debate",
      description: "Learn to be a proficient debater",
      routerPath: "/services/debate",
    },
    {
      title: "Confidence",
      description: "Learn to be a confident speaker",
      routerPath: "/services/confidence",
    },
    {
      title: "Expressions Measurement",
      description: "Measure your facial expressions",
      routerPath: "/services/expression",
    },
  ];
  return (
    // <div className="flex  items-center mt-40 flex-col space-y-3 flex-wrap ">
    //   <div className="flex gap-6 cursor-pointer py-4">
    //     <ServiceCard
    //       name="Communication Mentor"
    //       description="Practice and improve your communication skills,"
    //       onClick={() => router.push("/talk")}
    //     />
    //     <ServiceCard
    //       name="Voice Therapist"
    //       description="Improve your mental health, anything and everything and get personolized guidance."
    //       onClick={() => router.push("/services/therapist")}
    //     />

    //     <ServiceCard
    //       name="Expression Measurement"
    //       description="Measure your facial expressions"
    //       onClick={() => router.push("/services/expression")}
    //     />

    //     <ServiceCard
    //       name="Debate"
    //       description="Learn to communicate through debates"
    //       onClick={() => router.push("/services/debate")}
    //     />

    //     <ServiceCard
    //       name="Confidence"
    //       description="Learn to be a confident speaker"
    //       onClick={() => router.push("/services/confidence")}
    //     />
    //   </div>
    // </div>

    <div className="max-w-5xl mx-auto px-8">
      <h1 className="text-4xl pt-10 px-4  font-semibold">
        {" "}
        Services we provide{" "}
      </h1>

      <HoverEffect items={projects} />
    </div>
  );
};

export default page;
