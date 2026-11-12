import { analyseGas, analyseInputSchema } from "@/features/gaslens/server";
import { aiRoute } from "@/lib/server/ai-route";

export const maxDuration = 120;

export const POST = aiRoute(analyseInputSchema, analyseGas);
