import type { ReactNode } from "react";
import { metadata, viewport } from "./lib/metadata"; // Імпортуємо metadata та viewport

export { metadata, viewport }; // Експортуємо для Next.js

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <style>{`
          html, body, #__next {
            height: 100%;
            padding: 0;
            margin: 0;
          }
          #__next {
            margin: 0 auto;
          }
          h1 {
            text-align: center;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
