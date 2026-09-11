import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = { title: "goya24 — Next.js example" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: "3rem", lineHeight: 1.8 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
