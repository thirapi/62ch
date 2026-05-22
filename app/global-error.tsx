"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorDisplay } from "@/components/error-display";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <ErrorDisplay
          statusCode="500"
          imageSrc="https://raw.githubusercontent.com/Ender-Wiggin2019/ServiceLogos/main/503ServiceUnavailable.png/ServiceUnavailable.png"
          title="Terjadi Kesalahan Sistem"
          imageAlt="System Error Illustration"
          description="Sistem mengalami gangguan yang tidak terduga. Tim kami telah diberitahu dan akan segera memperbaikinya. Harap coba lagi nanti."
        />
      </body>
    </html>
  );
}
