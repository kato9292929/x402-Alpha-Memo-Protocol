// Middleware is intentionally minimal — payment enforcement is handled
// per-route via withX402 wrappers in each API route file, keeping the
// Edge Function well under the 1 MB size limit.
export {};
