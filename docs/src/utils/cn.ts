import { twMerge } from "tailwind-merge";

export function cn(...classes: (string | boolean | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
}
