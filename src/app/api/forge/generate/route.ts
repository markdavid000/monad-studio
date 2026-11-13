import { generateContract, generateInputSchema } from "@/features/forge/server";
import { aiRoute } from "@/lib/server/ai-route";

export const maxDuration = 60;

export const POST = aiRoute(generateInputSchema, generateContract);
