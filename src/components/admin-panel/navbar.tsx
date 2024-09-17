import { ModeToggle } from "~/components/mode-toggle";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";
import Logo from "../brand/Logo";
import { APP_NAME } from "~/lib/constants";
import { NavbarContentWrapper } from "./NavbarWrapper";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <Button
            className={cn(
              "-ml-3 mb-1 transition-transform duration-300 ease-in-out",
            )}
            variant="link"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Logo fill="hsl(var(--primary))" size="25" />
              <h1
                className={cn(
                  "hidden whitespace-nowrap text-lg font-bold transition-[transform,opacity,display] duration-300 ease-in-out sm:block",
                )}
              >
                {APP_NAME}
              </h1>
              <div className="text-top -ml-1 hidden justify-start self-start text-xs sm:block">
                [ALPHA]
              </div>
            </Link>
          </Button>
          <NavbarContentWrapper />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 flex items-center justify-end">
              <ModeToggle />
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Button asChild>
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                </SignedOut>
              </>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
