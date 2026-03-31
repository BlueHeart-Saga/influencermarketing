export const setFavicon = (iconUrl, fallback = "/favicon.ico") => {
  if (!iconUrl) return;

  const img = new Image();

  img.onload = () => applyFavicon(iconUrl);
  img.onerror = () => applyFavicon(fallback);

  // timeout fallback for slow backend / CDN
  setTimeout(() => {
    if (!img.complete) applyFavicon(fallback);
  }, 2000);

  img.src = iconUrl;
};

function applyFavicon(href) {
  let link = document.querySelector("link#dynamic-favicon");

  if (!link) {
    link = document.createElement("link");
    link.id = "dynamic-favicon";
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }

  link.href = href;
}
