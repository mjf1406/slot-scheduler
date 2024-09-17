import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { NavbarContent } from "./NavbarContent";

export function NavbarContentWrapper() {
  return (
    <ErrorBoundary fallback={<div></div>}>
      <Suspense fallback={<div></div>}>
        <NavbarContent />
      </Suspense>
    </ErrorBoundary>
  );
}

// Use NavbarContentWrapper instead of NavbarContent in the Navbar component
