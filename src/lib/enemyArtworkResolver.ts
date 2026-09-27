export function resolveEnemyArtworkUrl(
  url: string | undefined,
  index: string,
  name?: string,
  isLocalhost: boolean = true,
  repo: string = "japiohopman/artificer",
  branch: string = "main"
): string {
  let artworkPath: string | null = null;

  // 1. If explicit non-grid imageUrl is provided pointing to enemies/images/, preserve it
  if (url && url.includes('/enemies/images/')) {
    artworkPath = url.startsWith('/') ? url : '/' + url;
  }

  // 2. If url is a token path or missing, do NOT synthesize from a token path or invent a fallback.
  // Return null or empty string if no valid artwork path is present.
  if (!artworkPath) {
    return '';
  }

  if (isLocalhost) {
    return artworkPath;
  }
  return `https://raw.githubusercontent.com/${repo}/${branch}/public${artworkPath}`;
}
