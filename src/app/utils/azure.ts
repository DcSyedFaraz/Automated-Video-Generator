// utils/azure.ts
export function sanitizeSasUrl(raw: string) {
  // 1) Never pass the literal ellipsis – drop obviously-truncated tokens
  if (raw.includes("…")) return null;

  // 2) Do **not** re-encode the query section
  const u = new URL(raw);
  const safePath = encodeURI(u.pathname); // encode *only* the path
  return `${u.origin}${safePath}${u.search}`; // append unmodified ?sig=...
}
