<script setup lang="ts">
import { useGoya24 } from "@goya24/vue";

// `state` is reactive: `ready`, `open`, and `unread` — the last for a badge
// on the site's own button while the panel is shut.
const { open, close, state } = useGoya24();
</script>

<template>
  <main dir="rtl">
    <h1>فروشگاه نمونه</h1>
    <p>
      حباب پیش‌فرض گویا۲۴ برداشته شده است. دکمه‌های پایینِ صفحه مال همین سایت‌اند: «سوال دارم» باز
      می‌کند، دکمهٔ گرد می‌بندد.
    </p>
    <p class="state">
      {{ state.ready ? "پیام‌رسان آماده است" : "در حال بارگذاری" }} ·
      {{ state.open ? "باز" : "بسته" }}
    </p>

    <!-- Opens the panel. Shown while it is shut. -->
    <button v-if="!state.open" class="pill" @click="open">
      سوال دارم
      <span v-if="state.unread" class="badge">{{ state.unread }}</span>
    </button>

    <!-- Closes it. Shown while it is open, and the panel sits above it
         because of `padding.y` in nuxt.config.ts. -->
    <button v-else class="round" aria-label="بستن گفتگو" @click="close">✕</button>
  </main>
</template>

<style>
body {
  margin: 0;
  background: #fbfbfc;
  color: #1a1a1a;
  font-family: Tahoma, system-ui, sans-serif;
  line-height: 1.9;
}
main {
  margin: 3rem;
  max-width: 38rem;
}
.state {
  color: #666;
  font-size: 0.9rem;
}
/* Both buttons sit in the same corner, 24px off the bottom, 56px tall —
   the numbers `padding.y: 104` is derived from. */
.pill,
.round {
  position: fixed;
  inset-inline-end: 20px;
  bottom: 24px;
  z-index: 2147482000; /* under the messenger's own frame, above the page */
  height: 56px;
  border: 0;
  color: #fff;
  background: #ef8022;
  box-shadow: 0 8px 24px rgb(239 128 34 / 0.35);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
.pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-inline: 1.25rem;
  border-radius: 999px;
}
.round {
  display: grid;
  place-items: center;
  width: 56px;
  border-radius: 50%;
  font-size: 1.4rem;
}
.badge {
  display: grid;
  place-items: center;
  min-width: 1.4rem;
  height: 1.4rem;
  padding-inline: 0.3rem;
  border-radius: 999px;
  background: #fff;
  color: #ef8022;
  font-size: 0.8rem;
}
</style>
