import Link from "next/link";
import { SupportButton } from "../support-button";

// Our bubble is off on this page (see providers.tsx): the support button
// below is the way in, and it opens the same messenger the home page had.
export default function AccountPage() {
  return (
    <main>
      <h1>حساب کاربری</h1>
      <p>در این صفحه حباب پیام‌رسان نیست. دکمهٔ پشتیبانی همین صفحه آن را باز می‌کند.</p>
      <SupportButton />
      <p>
        <Link href="/">صفحهٔ اصلی</Link>
      </p>
    </main>
  );
}
