export async function onRequest({ request }) {
  const url = new URL(request.url);
  const text = getIconText(url.searchParams.get("text") || url.searchParams.get("letter") || "N");
  const bg = sanitizeHex(url.searchParams.get("bg") || "ff0000", "ff0000");
  const fg = sanitizeHex(url.searchParams.get("fg") || "ffffff", "ffffff");
  const size = clampNumber(url.searchParams.get("size"), 40, 220, 220);
  const fontSize = getFontSize(text, size);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#${bg}"/>
  <text x="256" y="256" text-anchor="middle" dominant-baseline="central" alignment-baseline="central"
    font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700"
    fill="#${fg}">${escapeXml(text)}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
      "access-control-allow-origin": "*",
    },
  });
}

function getIconText(value) {
  const text = String(value).trim().toUpperCase();
  return text || "N";
}

function sanitizeHex(value, fallback) {
  const cleaned = String(value).replace("#", "").trim();
  return /^[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, number));
}

function getFontSize(text, size) {
  const scaledSize = Math.round(size * (512 / 280));
  const estimatedWidth = text.length * scaledSize * 0.62;
  if (estimatedWidth <= 440) {
    return scaledSize;
  }
  return Math.max(72, Math.floor(scaledSize * (440 / estimatedWidth)));
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  }[char]));
}
