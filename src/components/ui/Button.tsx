"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { Spinner } from "./Spinner";

type Variant = "brand" | "white" | "ghost" | "ig";

const STYLES: Record<Variant, string> = {
  brand: "text-white",
  white: "bg-white text-black",
  ghost: "bg-white/10 text-white",
  ig: "bg-ig-blue text-white",
};

export function Button({
  children,
  onClick,
  variant = "brand",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const inactive = disabled || loading;
  return (
    <motion.button
      type={type}
      onClick={inactive ? undefined : onClick}
      disabled={disabled}
      whileTap={inactive ? undefined : { scale: 0.97 }}
      className={`relative flex h-[54px] w-full items-center justify-center rounded-full text-[17px] font-semibold transition-opacity ${STYLES[variant]} ${
        disabled ? "opacity-40" : ""
      } ${className}`}
      style={
        variant === "brand"
          ? {
              background: `linear-gradient(100deg, ${BRAND.colors.rose} 0%, ${BRAND.colors.overlap} 55%, ${BRAND.colors.violet} 100%)`,
              boxShadow: "0 10px 30px -10px rgba(201,75,216,0.7)",
            }
          : undefined
      }
    >
      <span className={loading ? "opacity-0" : ""}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner color={variant === "white" ? "#000" : "#fff"} />
        </span>
      )}
    </motion.button>
  );
}

export function TextButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ opacity: 0.5 }}
      className={`h-[44px] px-3 text-[16px] font-semibold ${className}`}
    >
      {children}
    </motion.button>
  );
}
