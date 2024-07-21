"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context state
interface MyContextType {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default value
const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
interface MyProviderProps {
  children: ReactNode;
}

export const MyProvider: React.FC<MyProviderProps> = ({ children }) => {
  const [state, setState] = useState<any>();
  const [isActive, setIsActive] = useState<boolean>(false);

  return (
    <MyContext.Provider value={{ state, setState, isActive, setIsActive }}>
      {children}
    </MyContext.Provider>
  );
};

// Custom hook to use the context
export const useMyContext = (): MyContextType => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
