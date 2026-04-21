const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4010/api";
const serverApiBaseUrl = process.env.INTERNAL_API_URL || publicApiBaseUrl;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPublicApiBaseUrl() {
  return trimTrailingSlash(publicApiBaseUrl);
}

export function getServerApiBaseUrl() {
  return trimTrailingSlash(serverApiBaseUrl);
}

export function apiUrl(path: string, mode: "public" | "server" = "public") {
  const baseUrl = mode === "server" ? getServerApiBaseUrl() : getPublicApiBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
