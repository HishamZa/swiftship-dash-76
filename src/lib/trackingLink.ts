/** Public shareable tracking URL for a shipment (works without login). */
export function publicTrackingPath(tracking: string) {
  return `/t/${encodeURIComponent(tracking)}`;
}

export function publicTrackingUrl(tracking: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${publicTrackingPath(tracking)}`;
}

export async function copyTrackingLink(tracking: string) {
  const url = publicTrackingUrl(tracking);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  return url;
}
