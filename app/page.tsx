import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Main content area: split screen */}
      <main className="flex-1 lg:grid lg:grid-cols-2">
        
        {/* Left Column (Info & CTA) */}
        <div className="relative flex min-h-[50vh] flex-col justify-center overflow-hidden p-12 text-white lg:min-h-0 lg:p-16">
          
          {/* Background Image (Placeholder) */}
          {/* TODO: Replace "/barista-bg.jpg" with your background image from the design */}
          <Image
            src="/barista-bg.png" // Placeholder image
            alt="Coffee shop background"
            fill
            className="z-0 object-cover"
            priority
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 z-0 bg-black opacity-70"></div>

          {/* Content */}
          <div className="relative z-10">
            
            {/* Logo (as text, based on image) */}
            {/* TODO: Replace this with your actual <Image> logo component if you have it */}
            <Image
            src="/sidaya-logo.png" // Placeholder image
            alt="Coffee shop background"
            width={300}
            height={150}
            className="z-0 object-cover"
            priority
          />

            {/* Headline */}
            <h2 className="mt-10 max-w-md text-4xl font-semibold leading-snug">
              Aplikasi wirausaha untuk kelola bisnismu jadi lebih maju.
            </h2>

            {/* CTA Button */}
            <a
              href="/login" // TODO: Update this link
              className="mt-10 inline-block w-fit rounded-lg bg-[#1fdd0b] px-8 py-3 text-lg font-bold text-black shadow-lg transition-transform hover:scale-105"
            >
              Mulai Sekarang
            </a>
          </div>
        </div>

        {/* Right Column (Product Image) */}
        <div className="flex items-center justify-center bg-gray-50 p-12">
          
          {/* TODO: Replace "/sidaya-app-tablet.png" with your product screenshot */}
          <Image
            src="/sidaya-app-tablet.png" // Placeholder image
            alt="Sidaya app dashboard on a tablet"
            width={1000}
            height={950}
            className="rounded-lg shadow-2xl"
          />
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="w-full bg-[#1fdd0b] p-3 text-center">
        <p className="text-sm font-medium text-black">
          Sidaya App ver. 0.0.1
        </p>
      </footer>
    </div>
  );
}