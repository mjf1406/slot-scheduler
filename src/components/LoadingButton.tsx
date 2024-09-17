"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => Promise<void>;
  loading?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  href,
  children,
  variant = "default",
  className,
  type = "button",
  onClick,
  loading,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (onClick) {
      setIsLoading(true);
      try {
        await onClick();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isButtonLoading = loading ?? isLoading;

  const buttonContent = (
    <>
      <span className={cn(isButtonLoading && "invisible")}>{children}</span>
      {isButtonLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Button
        variant={variant}
        className={cn(
          className,
          "relative",
          isButtonLoading && "cursor-not-allowed opacity-50",
        )}
        asChild
      >
        <Link href={href}>{buttonContent}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={isButtonLoading}
      type={type}
      className={cn(
        className,
        "relative",
        isButtonLoading && "cursor-not-allowed opacity-50",
      )}
    >
      {buttonContent}
    </Button>
  );
};

export default LoadingButton;
