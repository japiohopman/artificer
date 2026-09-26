export function resolveEnemyArtworkUrl(
  url: string | undefined,
  index: string,
  name?: string,
  isLocalhost: boolean = true,
  repo: string = "japiohopman/artificer",
  branch: string = "main"
): string {
  const isFoundryId = /^[a-z0-9]{16}$/i.test(index);
  const baseIdentifier = (isFoundryId && name) ? name : (index || "");
  const cleanIndex = baseIdentifier.toLowerCase();
  const ddbIndex = cleanIndex.replace(/_/g, '-').replace(/\s+/g, '-');

  let filename = ddbIndex ? `${ddbIndex}.webp` : '';
  if (url && url.includes('/enemies/images/')) {
    const parts = url.split('/enemies/images/');
    if (parts[1]) {
      filename = parts[1].split('?')[0];
    }
  }

  if (!filename) {
    return '';
  }

  if (isLocalhost) {
    return `/assets/atlas/enemies/images/${filename}`;
  }
  return `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/atlas/enemies/images/${filename}`;
}
