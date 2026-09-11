"use client";

import type { ReactNode } from "react";
import { Goya24Provider } from "@goya24/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Goya24Provider
      workspaceKey={process.env.NEXT_PUBLIC_GOYA24_KEY ?? "d24_pk_replace_me"}
      {...(process.env.NEXT_PUBLIC_GOYA24_ORIGIN
        ? { origin: process.env.NEXT_PUBLIC_GOYA24_ORIGIN }
        : {})}
      locale="fa"
    >
      {children}
    </Goya24Provider>
  );
}
