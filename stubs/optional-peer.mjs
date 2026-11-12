function unavailable() {
  throw new Error("x402 payments are not part of MonadStudio.");
}

export const toClientEvmSigner = unavailable;
export const x402Client = unavailable;
export const ExactEvmScheme = unavailable;
export const UptoEvmScheme = unavailable;
export const ExactSvmScheme = unavailable;
