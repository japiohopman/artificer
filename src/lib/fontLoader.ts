/**
 * Utility to dynamically inject @font-face rules into the document.
 */

const injectedFonts = new Set<string>();

export function injectFontFace(fontName: string, ttfUrls: string | string[]) {
  if (injectedFonts.has(fontName)) return;

  const urls = Array.isArray(ttfUrls) ? ttfUrls : [ttfUrls];
  const src = urls.map(url => `url('${url}') format('truetype')`).join(', ');

  const style = document.createElement('style');
  style.id = `font-face-${fontName}`;
  style.textContent = `
    @font-face {
      font-family: '${fontName}';
      src: ${src};
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
  injectedFonts.add(fontName);
}

export function getLanguageFontFamily(languageIndex: string): string {
  return `language-font-${languageIndex}`;
}
