import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/studio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/studio/monguard`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
