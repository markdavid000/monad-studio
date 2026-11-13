import { fixContract, fixInputSchema } from "@/features/monguard/server";
import { aiRoute } from "@/lib/server/ai-route";

export const maxDuration = 120;

export const POST = aiRoute(fixInputSchema, fixContract);
