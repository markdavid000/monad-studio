import { z } from "zod";

const publicEnvSchema = z.object({
  siteUrl: z.url(),
  walletConnectProjectId: z.string().min(1),
});

export const publicEnv = publicEnvSchema.parse({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});
