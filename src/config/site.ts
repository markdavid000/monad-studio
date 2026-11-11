import { siteCopy } from "./copy";

export const siteConfig = {
  name: siteCopy.name,
  description: siteCopy.description,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
