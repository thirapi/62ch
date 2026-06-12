import { ErrorDisplay } from "@/components/error-display";

export default function NotFound() {
  return (
    <ErrorDisplay
      statusCode="404"
      imageSrc="https://raw.githubusercontent.com/Ender-Wiggin2019/ServiceLogos/main/404Notfound/NotFound.png"
      title="Halaman Tidak Ditemukan"
      imageAlt="404 Not Found Illustration"
      description="Maaf, halaman atau utas yang Anda cari mungkin telah dihapus, kadaluarsa, atau tidak pernah ada sejak awal."
    />
  );
}
