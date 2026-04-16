"use client";

import { createContext, useContext, useState } from "react";
import { setActivePoolAction } from "@/app/actions/pool_actions";

interface PoolContextType {
  activePoolId: number | null;
  setActivePool: (poolId: number) => Promise<void>;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export function PoolProvider({ 
  children, 
  initialPoolId 
}: { 
  children: React.ReactNode; 
  initialPoolId: number | null;
}) {
  const [activePoolId, setActivePoolId] = useState<number | null>(initialPoolId);

  const setActivePool = async (poolId: number) => {
    setActivePoolId(poolId);
    await setActivePoolAction(poolId);
  };

  return (
    <PoolContext.Provider value={{ activePoolId, setActivePool }}>
      {children}
    </PoolContext.Provider>
  );
}

export function usePool() {
  const context = useContext(PoolContext);
  if (context === undefined) {
    throw new Error("usePool must be used within a PoolProvider");
  }
  return context;
}
