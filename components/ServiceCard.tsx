import React from "react";
import { Button } from "./ui/button";

const ServiceCard = ({ name, description, onClick }: any) => {
  return (
    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 relative">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {name}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400 mb-12">
        {description}
      </p>
      <Button className="mt-4 absolute bottom-4 right-4" onClick={onClick}>
        Try now
      </Button>
    </div>
  );
};

export default ServiceCard;
