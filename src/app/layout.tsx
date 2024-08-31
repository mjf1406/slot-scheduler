import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { poppins } from "./fonts";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/components/theme/theme-provider";
import Providers from "./providers";

export const metadata = {
  title: "Slotted",
  description: "Easily scheduling for teachers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.className}`}>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <main>{children}</main>
              <Toaster />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
