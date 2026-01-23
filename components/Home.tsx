import Image from "next/image";

export default function Home() {
  return (
    <section className="w-full bg-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight max-w-80">
            Baca komik? Di FluxInkVerse aja!!
          </h1>

          <p className="text-gray-600 max-w-md">
            Selamat datang di website kami FluxInkVerse website ini digunakan untuk membaca komik, manhwa, atau ilustrasi anime
          </p>

          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-black text-white rounded-md hover:opacity-90 transition">
              Button
            </button>
            <button className="px-5 py-2.5 border border-black text-black rounded-md hover:bg-black hover:text-white transition">
              Button
            </button>
          </div>
        </div>

        <div className="relative w-full h-[300px] md:h-[360px] bg-gray-300 rounded-md overflow-hidden">
          <Image
            src="/image.png"
            alt="Hero Image"
            fill
            className="object-cover"
          />
        </div>

      </div>
    </section>
  );
}
