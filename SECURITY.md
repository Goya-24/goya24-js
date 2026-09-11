# Security

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Email **security@goya24.com** with what you found, how to reproduce it, and what you think the impact is. You will get an acknowledgement within two working days and a fix or a plan within a week for anything confirmed.

## What is in scope

- The packages in this repository (`@goya24/messenger`, `@goya24/react`, `@goya24/vue`, `@goya24/nuxt`).
- The way they load and talk to the messenger frame — origin checks on `postMessage`, what gets put in the page, what gets read from it.

The messenger itself, the goya24 API and the goya24 website are covered by the same address but are not in this repository.

## What the SDK does and does not touch

- It injects one `<script>` tag from your configured `origin` and one `<iframe>` from the same origin. It reads nothing else from your page.
- Messages between the page and the frame are checked against that origin on both sides.
- The claimed identity you pass (`email`, `name`, `traits`) is sent to your own workspace and nowhere else. A **proven** identity requires an HMAC computed on your server; the SDK never sees your signing key and must not — do not ship it to the browser.

## Supported versions

The latest minor release of each package receives security fixes.
