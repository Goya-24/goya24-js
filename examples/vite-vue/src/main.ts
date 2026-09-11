import { createApp } from "vue";
import { createGoya24 } from "@goya24/vue";
import App from "./App.vue";

createApp(App)
  .use(
    createGoya24({
      key: import.meta.env.VITE_GOYA24_KEY ?? "d24_pk_replace_me",
      ...(import.meta.env.VITE_GOYA24_ORIGIN ? { origin: import.meta.env.VITE_GOYA24_ORIGIN } : {}),
      locale: "fa",
    }),
  )
  .mount("#app");
