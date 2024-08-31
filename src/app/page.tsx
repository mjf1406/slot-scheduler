import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import FrequentlyAskedQuestions from "~/components/brand/FAQ";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <ContentLayout title="Slotted">
      <main className="flex min-h-screen flex-col items-center justify-center gap-32 bg-background p-5 text-foreground">
        <div
          id="hero"
          className="container flex h-dvh flex-col items-center justify-center gap-12 px-4 py-16"
        >
          <div className="flex items-center gap-3">
            <h1 className="flex flex-col text-5xl font-extrabold tracking-tight">
              <span className="text-primary">Your Timetables.</span>
              <span className="text-accent">Easily adjusted.</span>
            </h1>
          </div>
          <div className="max-w-lg text-center text-xl tracking-tight md:text-2xl">
            Effortlessly set up predefined time slots, then drag and drop events
            all around.
          </div>
          <div className="space-x-4">
            <SignedOut>
              <Button asChild>
                <Link href={"/timetables"}>
                  Get Started{" "}
                  <ArrowRight className="ml-0.5 inline-block h-5 w-5" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild>
                <Link href={"/timetables"}>
                  Timetables{" "}
                  <ArrowRight className="ml-0.5 inline-block h-5 w-5" />
                </Link>
              </Button>
            </SignedIn>
            <Button asChild variant={"secondary"}>
              <Link href={"#features"}>Learn more</Link>
            </Button>
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
    </ContentLayout>
  );
}
