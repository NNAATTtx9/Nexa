import Image from "next/image";

export default function RootAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const singaporeBackground =
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80";
  const bankIllustration =
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80";

  return (
    <main className="auth-shell flex min-h-screen text-slate-900">
      <section className="auth-main flex w-full flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-16">
        {children}
      </section>

      <section
        className="auth-asset flex items-center justify-center px-8 py-10 lg:w-[46%]"
        style={{
          backgroundImage: `linear-gradient(rgba(7, 24, 43, 0.68), rgba(7, 24, 43, 0.42)), url(${singaporeBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative h-[560px] w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/20 bg-[#07182b]/60 p-9 shadow-[0_30px_100px_rgba(4,19,36,0.35)] backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,_rgba(87,213,190,0.34),_transparent_35%),linear-gradient(140deg,transparent_30%,rgba(255,255,255,0.08))]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icons/logo.svg" width={40} height={40} alt="Nexa logo" />
              <span className="font-ibm-plex-serif text-3xl font-bold tracking-tight text-white">Nexa <span className="font-inter text-xs font-medium uppercase tracking-[0.28em] text-teal-200">Global</span></span>
            </div>

            <div className="space-y-4">
              <h2 className="max-w-sm text-4xl font-semibold leading-tight text-white">
                One view for every part of your financial life.
              </h2>
              <p className="max-w-md text-base text-white/85">
                Move confidently across borders with a calmer, clearer way to manage your money.
              </p>
            </div>

            <div className="flex justify-end">
              <div className="h-32 w-32 overflow-hidden rounded-[24px] border border-white/60 bg-white/20 shadow-[0_20px_50px_rgba(33,85,177,0.18)]">
                <Image
                  src={bankIllustration}
                  alt="Banking illustration"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
