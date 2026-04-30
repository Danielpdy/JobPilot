
// Browser uses NEXT_PUBLIC_API_BASE_URL (baked at build time).
// Server-side code (NextAuth authorize, RSC) uses BACKEND_INTERNAL_URL
// so it can reach the backend container by name inside Docker.
export const API_BASE_URL =
  typeof window === 'undefined'
    ? (process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL)
    : process.env.NEXT_PUBLIC_API_BASE_URL;