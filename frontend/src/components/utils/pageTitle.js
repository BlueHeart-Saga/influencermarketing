export const setPageTitle = (pageName, metaDescription) => {
  const platform = window.__PLATFORM_NAME__ || "Brio";

  // 1) Browser tab title
  if (!pageName) {
    document.title = platform;
  } else {
    document.title = pageName;
  }

  // 2) Meta description tag
  let descriptionTag = document.querySelector("meta[name='description']");
  if (!descriptionTag) {
    descriptionTag = document.createElement("meta");
    descriptionTag.name = "description";
    document.head.appendChild(descriptionTag);
  }
  if (metaDescription) {
    descriptionTag.content = metaDescription;
  }

  // 3) OpenGraph Title (Social preview)
  let ogTitle = document.querySelector("meta[property='og:title']");
  if (!ogTitle) {
    ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = pageName || platform;
};
