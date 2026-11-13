import { verifySource, verifySourceInputSchema } from "@/features/forge/server";
import { aiRoute } from "@/lib/server/ai-route";
import { limitCompileCall } from "@/lib/server/rate-limit";

export const maxDuration = 30;

export const POST = aiRoute(verifySourceInputSchema, verifySource, limitCompileCall);
