"use client";

import { useGoya24 } from "@goya24/react";

export function SupportButton() {
  const { toggle, unreadCount, isOpen, ready } = useGoya24();
  return (
    <p>
      <button
        onClick={toggle}
        style={{
          font: "inherit",
          padding: "0.6rem 1.2rem",
          borderRadius: "0.6rem",
          cursor: "pointer",
        }}
      >
        پشتیبانی{unreadCount > 0 ? ` (${unreadCount})` : ""}
      </button>{" "}
      <small>
        {ready ? "آماده" : "در حال بارگذاری"} · {isOpen ? "باز" : "بسته"}
      </small>
    </p>
  );
}
