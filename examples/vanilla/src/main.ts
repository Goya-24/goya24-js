import { load } from "@goya24/messenger";

const messenger = load({
  key: import.meta.env.VITE_GOYA24_KEY ?? "d24_pk_replace_me",
  // Point at your own deployment while developing; leave out for goya24.com.
  ...(import.meta.env.VITE_GOYA24_ORIGIN ? { origin: import.meta.env.VITE_GOYA24_ORIGIN } : {}),
  locale: "fa",
});

const button = document.querySelector<HTMLButtonElement>("#support")!;
const badge = document.querySelector<HTMLSpanElement>("#badge")!;
const state = document.querySelector<HTMLParagraphElement>("#state")!;

button.addEventListener("click", () => messenger.toggle());

const show = () => {
  const s = messenger.getState();
  state.textContent = `${s.ready ? "آماده" : "در حال بارگذاری"} · ${s.open ? "باز" : "بسته"}`;
};
messenger.on("ready", show);
messenger.on("open", show);
messenger.on("close", show);
messenger.on("unread", ({ count }) => {
  badge.textContent = count ? String(count) : "";
});
messenger.on("error", ({ reason }) => {
  state.textContent = `پیام‌رسان بالا نیامد: ${reason}`;
});
show();
