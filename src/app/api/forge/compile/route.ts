import { compileInputSchema, compileSolidity } from "@/features/forge/server";
import { aiRoute } from "@/lib/server/ai-route";
import { limitCompileCall } from "@/lib/server/rate-limit";

export const maxDuration = 30;

export const POST = aiRoute(
  compileInputSchema,
  async (input) => compileSolidity(input),
  limitCompileCall
);
