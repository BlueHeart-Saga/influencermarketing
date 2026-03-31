// import API_BASE_URL from "../config/api";

// export const fetchPlatformBranding = async () => {
//   const [nameRes] = await Promise.all([
//     fetch(`${API_BASE_URL}/platform/name`)
//   ]);

//   const nameData = await nameRes.json();

//   return {
//     title: nameData.platform_name,
//     favicon: `${API_BASE_URL}/logo/current`
//   };
// };

import API_BASE_URL from "../config/api";

export const fetchPlatformBranding = async () => {
  const res = await fetch(`${API_BASE_URL}/api/platform/name`);
  const data = await res.json();

  return {
    platformName: data.platform_name,
    favicon: `${API_BASE_URL}/api/logo/current`,
  };
};
