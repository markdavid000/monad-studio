import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/demo`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/demo/monguard`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/demo/gaslens`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
