// Client-safe upload metadata. Actual reference passages stay in the server-only retrieval module.
export type UploadedManual = { name: string; text: string };
export const UPLOADED_MANUAL_KEY = 'firstday-uploaded-manual-v1';
export const MAX_UPLOAD_BYTES = 20_000;
