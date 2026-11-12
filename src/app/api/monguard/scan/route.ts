import { scanContract, scanInputSchema } from "@/features/monguard/server";
import { aiRoute } from "@/lib/server/ai-route";

export const maxDuration = 60;

export const POST = aiRoute(scanInputSchema, scanContract);
