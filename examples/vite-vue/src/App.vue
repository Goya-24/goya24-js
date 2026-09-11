<script setup lang="ts">
import { useGoya24 } from "@goya24/vue";

const { toggle, state } = useGoya24();
</script>

<template>
  <main style="font-family: system-ui, sans-serif; margin: 3rem; line-height: 1.8">
    <h1>فروشگاه نمونه</h1>
    <p>یک اپ Vue 3 با پلاگین گویا۲۴ و یک دکمهٔ پشتیبانی که پیام‌رسان را باز می‌کند.</p>
    <p>
      <button
        style="font: inherit; padding: 0.6rem 1.2rem; border-radius: 0.6rem; cursor: pointer"
        @click="toggle"
      >
        پشتیبانی<span v-if="state.unread"> ({{ state.unread }})</span>
      </button>
      <small>
        {{ state.ready ? "آماده" : "در حال بارگذاری" }} · {{ state.open ? "باز" : "بسته" }}</small
      >
    </p>
  </main>
</template>
