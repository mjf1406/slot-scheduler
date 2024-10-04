import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";
import Logo from "../brand/Logo";
import { APP_NAME } from "~/lib/constants";

export function Navbar() {
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
        </div>
      </div>
    </header>
  );
}
