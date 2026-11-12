import "server-only";
import type { UpstreamErrorCode } from "@/lib/api-error";

export class UpstreamError extends Error {
  readonly code: UpstreamErrorCode;

  constructor(code: UpstreamErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UpstreamError";
    this.code = code;
  }
}
