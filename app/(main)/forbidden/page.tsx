import { ErrorDisplay } from "@/components/error-display";

export default function Forbidden() {
  return (
    <ErrorDisplay
      statusCode="403"
      imageSrc="https://raw.githubusercontent.com/Ender-Wiggin2019/ServiceLogos/main/403Forbidden/Forbidden.png"
      title="Akses Dilarang"
      imageAlt="403 Forbidden Illustration"
      description="Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Ini mungkin karena pembatasan moderasi atau hak akses yang tidak memadai."
    />
  );
}
