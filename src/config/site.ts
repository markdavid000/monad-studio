import { siteCopy } from "./copy";
import { publicEnv } from "./env";

export const siteConfig = {
  name: siteCopy.name,
  description: siteCopy.description,
  url: publicEnv.siteUrl,
} as const;

export const siteLinks = {
  github: "https://github.com/markdavid000/monad-studio",
} as const;
