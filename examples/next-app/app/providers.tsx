"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Goya24Provider } from "@goya24/react";

export function Providers({ children }: { children: ReactNode }) {
  // The account pages have the support button in their own header, so our
  // bubble stays off there. Changing the prop moves the messenger that is
  // already on the page; it is not reloaded, and a conversation stays open.
  const inAccount = usePathname().startsWith("/account");
  return (
    <Goya24Provider
      workspaceKey={process.env.NEXT_PUBLIC_GOYA24_KEY ?? "d24_pk_replace_me"}
      {...(process.env.NEXT_PUBLIC_GOYA24_ORIGIN
        ? { origin: process.env.NEXT_PUBLIC_GOYA24_ORIGIN }
        : {})}
      locale="fa"
      launcher={!inAccount}
    >
      {children}
    </Goya24Provider>
  );
}
