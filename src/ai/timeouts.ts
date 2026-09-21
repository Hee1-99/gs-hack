// Gemini rejects explicit upstream deadlines shorter than 10 seconds.
// Local cancellation and the browser deadline bound the whole interaction separately.
export const PROVIDER_REQUEST_TIMEOUT_MS = 15_000;
export const AI_TIMEOUT_MS = 12_000;
export const CLIENT_REQUEST_TIMEOUT_MS = 20_000;
