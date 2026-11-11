import Link from "next/link";
import { siteConfig } from "@/config/site";
import { layoutCopy } from "./copy";

export function BrandLink() {
  return (
    <Link href="/" aria-label={layoutCopy.home} className="font-semibold tracking-tight">
      {siteConfig.name}
    </Link>
  );
}
