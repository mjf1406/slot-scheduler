import FrequentlyAskedQuestions from "~/components/brand/FAQ";
import TopNav from "~/components/navigation/TopNav";

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="flex min-h-screen flex-col items-center justify-center gap-32 bg-background p-5 text-foreground">
        <div
          id="hero"
          className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <div className="flex items-center gap-3">
            <h1 className="flex flex-col text-5xl font-extrabold tracking-tight">
              <span className="text-primary">Your.</span>
              <span className="text-accent">Tagline.</span>
            </h1>
          </div>
          <div className="max-w-lg text-center text-xl tracking-tight md:text-2xl">
            Your quick description.
          </div>
        </div>
        <div className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16">
          <h2 id="features" className="scroll-m-20 text-4xl">
            Features
          </h2>
        </div>
        <div className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16">
          <h2 id="pricing" className="scroll-m-20 text-4xl">
            Pricing
          </h2>
        </div>
        <FrequentlyAskedQuestions />
      </main>
    </>
  );
}
