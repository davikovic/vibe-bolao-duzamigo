"use client";

import { SessionProvider } from "next-auth/react";
import { PoolProvider } from "@/components/providers/pool-provider";

export function Providers({ 
  children, 
  initialPoolId 
}: { 
  children: React.ReactNode;
  initialPoolId: number | null;
}) {
  return (
    <SessionProvider>
      <PoolProvider initialPoolId={initialPoolId}>
        {children}
      </PoolProvider>
    </SessionProvider>
  );
}
