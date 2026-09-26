---
"@goya24/messenger": minor
---

`user.phone` reaches goya24. It was not part of `User`, and both the `data-user` tag and the `identify()` claim dropped it, so a number a site passed never arrived; it now travels with the name and email.
